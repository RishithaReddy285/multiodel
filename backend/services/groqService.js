const { Groq } = require('groq-sdk');
const pdfParse = require('pdf-parse');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

async function analyzeDocument(file) {
  let promptText = '';
  let messages = [];
  let model = "llama-3.3-70b-versatile"; // Default for text/PDF

  try {
    if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(file.buffer);
      promptText = `You are an expert document analyzer. Analyze the following PDF document text and extract the summary, explanation, issues, and suggestions.\n\n${data.text}`;
      messages = [{ role: "user", content: promptText }];
    } else if (file.mimetype.startsWith('image/')) {
      model = "llama-3.2-11b-vision-preview"; // Vision model for images
      const base64Image = file.buffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64Image}`;
      
      messages = [
        {
          role: "user",
          content: [
            { type: "text", text: "You are an expert visual analyzer. Analyze this image and provide a summary, detailed explanation, potential issues, and improvement suggestions." },
            { type: "image_url", image_url: { url: dataUrl } }
          ]
        }
      ];
    } else {
      // Treat as plain text / code
      const text = file.buffer.toString('utf-8');
      promptText = `You are an expert document and code analyzer. Analyze the following document/code and extract the summary, explanation, issues, and suggestions.\n\n${text}`;
      messages = [{ role: "user", content: promptText }];
    }

    // Common system instruction for JSON output format
    messages.unshift({
      role: "system",
      content: `Always respond strictly in the following JSON format without markdown blocks or extra text:
{
  "summary": "Brief summary",
  "explanation": "Detailed explanation",
  "issues": ["List of potential bugs, errors, or security issues"],
  "suggestions": ["List of optimization and improvement suggestions"]
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
    console.error("Failed to parse Groq response:", error);
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
