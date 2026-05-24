const { Groq } = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '', // Fallback to provided key
});

async function analyzeCode(code, language) {
  const prompt = `
You are an expert software developer and code reviewer. Analyze the following ${language || 'unknown'} code and provide your response strictly in the following JSON format:
{
  "summary": "Brief summary of what the code does",
  "explanation": "Detailed explanation of the code logic",
  "issues": ["List of potential bugs, errors, or security issues"],
  "suggestions": ["List of optimization and improvement suggestions"]
}

Code to analyze:
\`\`\`
${code}
\`\`\`

Return ONLY the JSON string, without any markdown blocks or extra text.
`;

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama3-70b-8192",
    temperature: 0.1,
    max_tokens: 2000,
  });

  try {
    const rawContent = response.choices[0].message.content;
    const jsonStr = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse Groq response:", error);
    return {
      summary: "Failed to generate structured analysis.",
      explanation: response.choices[0].message.content,
      issues: [],
      suggestions: []
    };
  }
}

module.exports = {
  analyzeCode
};
