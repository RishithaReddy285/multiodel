const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const { analyzeCode, analyzeDocument } = require('./services/groqService');
const chromaService = require('./services/chromaService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Set up multer for in-memory file handling
const upload = multer({ storage: multer.memoryStorage() });

// Initialize ChromaDB
(async () => {
  try {
    await chromaService.init();
    console.log('ChromaDB connected and collection initialized.');
  } catch (error) {
    console.error('Error initializing ChromaDB:', error);
  }
})();

// New Endpoint for Multimodal Document Analysis
app.post('/api/upload-analyze', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Analyzing file: ${file.originalname} (${file.mimetype})`);
    
    // Pass the file buffer, mimetype, and original name to the groq service
    const analysis = await analyzeDocument(file);
    
    // Save to history asynchronously
    chromaService.saveAnalysis(file.originalname, file.mimetype, analysis).catch(err => {
      console.error('Failed to save analysis to ChromaDB:', err);
    });

    res.json({ analysis });
  } catch (error) {
    console.error('Analyze Error:', error);
    res.status(500).json({ error: 'Failed to analyze document' });
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
