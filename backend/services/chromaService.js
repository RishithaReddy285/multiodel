const { ChromaClient } = require('chromadb');
const { v4: uuidv4 } = require('uuid');

const client = new ChromaClient({ path: process.env.CHROMA_HOST || "http://localhost:8000" });
let collection;

async function init() {
  // Try to get or create collection
  try {
    collection = await client.getOrCreateCollection({
      name: "code_analyses",
      metadata: { "hnsw:space": "cosine" }
    });
  } catch (e) {
    console.warn("ChromaDB initialization failed. Make sure ChromaDB is running on port 8000.");
  }
}

async function saveAnalysis(code, language, analysis) {
  if (!collection) return;
  
  const id = uuidv4();
  
  // Create a combined text for embedding
  const documentText = `${language} code: ${code}\nSummary: ${analysis.summary}`;
  
  await collection.add({
    ids: [id],
    documents: [documentText],
    metadatas: [{ 
      language: language || 'unknown',
      timestamp: new Date().toISOString(),
      code: code,
      summary: analysis.summary,
      issues: JSON.stringify(analysis.issues),
      suggestions: JSON.stringify(analysis.suggestions),
      explanation: analysis.explanation
    }]
  });
  
  return id;
}

async function getHistory(limit = 20) {
  if (!collection) return [];
  
  try {
    const results = await collection.get({
      limit: limit
    });
    
    // Format results
    const history = [];
    if (results.ids && results.ids.length > 0) {
      for (let i = 0; i < results.ids.length; i++) {
        history.push({
          id: results.ids[i],
          document: results.documents[i],
          metadata: results.metadatas[i]
        });
      }
    }
    
    // Sort by timestamp desc
    return history.sort((a, b) => new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp));
  } catch (e) {
    console.error("Error fetching history:", e);
    return [];
  }
}

module.exports = {
  init,
  saveAnalysis,
  getHistory
};
