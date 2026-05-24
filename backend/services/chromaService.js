const { v4: uuidv4 } = require('uuid');

// In-memory history store (works without external ChromaDB server)
let historyStore = [];

async function init() {
  console.log('History store initialized (in-memory).');
}

async function saveAnalysis(fileName, fileType, analysis) {
  const id = uuidv4();
  
  historyStore.unshift({
    id: id,
    document: `${fileName} (${fileType})`,
    metadata: {
      language: fileType,
      timestamp: new Date().toISOString(),
      code: fileName,
      summary: analysis.summary || '',
      issues: JSON.stringify(analysis.issues || []),
      suggestions: JSON.stringify(analysis.suggestions || []),
      explanation: analysis.explanation || ''
    }
  });

  // Keep only last 50 items
  if (historyStore.length > 50) {
    historyStore = historyStore.slice(0, 50);
  }
  
  return id;
}

async function getHistory(limit = 20) {
  return historyStore.slice(0, limit);
}

module.exports = {
  init,
  saveAnalysis,
  getHistory
};
