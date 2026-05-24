const { Groq } = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

async function extractPdfText(buffer) {
  // pdf-parse v1.x accepts a buffer directly and returns { text, numpages, info }
  const pdfParse = require('pdf-parse');
  const data = await pdfParse(buffer);
  return data.text || '';
}

async function analyzeDocument(file) {
  let messages = [];
  let model = "llama-3.3-70b-versatile";

  try {
    if (file.mimetype === 'application/pdf') {
      const pdfText = await extractPdfText(file.buffer);
      
      if (!pdfText.trim()) {
        return {
          summary: "Empty or scanned PDF",
          explanation: "The PDF appears to be empty or contains only scanned images without extractable text. Try uploading an image-based document instead.",
          issues: ["No extractable text found in the PDF"],
          suggestions: ["If this is a scanned document, try uploading it as an image (JPG/PNG) for visual analysis"]
        };
      }
      
      messages = [{
        role: "user",
        content: `You are an expert document analyzer. Analyze the following PDF document text thoroughly and provide a comprehensive analysis.\n\nDocument Text:\n${pdfText.substring(0, 8000)}`
      }];
    } else if (file.mimetype.startsWith('image/')) {
      model = "llama-3.2-11b-vision-preview";
      const base64Image = file.buffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64Image}`;
      
      messages = [{
        role: "user",
        content: [
          { type: "text", text: "You are an expert visual analyzer. Analyze this image thoroughly and provide a summary, detailed explanation of what the image contains, any potential issues you notice, and improvement suggestions." },
          { type: "image_url", image_url: { url: dataUrl } }
        ]
      }];
    } else {
      const text = file.buffer.toString('utf-8');
      messages = [{
        role: "user",
        content: `You are an expert document and code analyzer. Analyze the following document/code thoroughly.\n\nDocument Content:\n${text.substring(0, 8000)}`
      }];
    }

    // System instruction for JSON output
    messages.unshift({
      role: "system",
      content: `Always respond strictly in the following JSON format without markdown blocks or extra text:
{
  "summary": "Brief summary of the document",
  "explanation": "Detailed explanation of the document contents",
  "issues": ["List of potential issues found in the document"],
  "suggestions": ["List of improvement suggestions"]
}`
    });

    const response = await groq.chat.completions.create({
      messages: messages,
      model: model,
      temperature: 0.1,
      max_tokens: 2000,
    });

    const rawContent = response.choices[0].message.content;
    const jsonStr = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Groq analysis error:", error.message);
    return {
      summary: "Error during analysis",
      explanation: error.message || "Failed to analyze the document.",
      issues: [],
      suggestions: []
    };
  }
}

module.exports = {
  analyzeDocument
};
