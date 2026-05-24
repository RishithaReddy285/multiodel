const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { analyzeCode } = require('./services/groqService');
const chromaService = require('./services/chromaService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize ChromaDB
(async () => {
  try {
    await chromaService.init();
    console.log('ChromaDB connected and collection initialized.');
  } catch (error) {
    console.error('Error initializing ChromaDB:', error);
  }
})();

// Analyze Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { code, language } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    console.log(`Analyzing ${language || 'unknown'} code...`);
    const analysis = await analyzeCode(code, language);
    
    // Save to history asynchronously
    chromaService.saveAnalysis(code, language, analysis).catch(err => {
      console.error('Failed to save analysis to ChromaDB:', err);
    });

    res.json({ analysis });
  } catch (error) {
    console.error('Analyze Error:', error);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
});

// History Endpoint
app.get('/api/history', async (req, res) => {
  try {
    const history = await chromaService.getHistory();
    res.json({ history });
  } catch (error) {
    console.error('History Error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
