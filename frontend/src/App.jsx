import { useState, useEffect } from 'react';
import axios from 'axios';
import CodeEditor from './components/CodeEditor';
import AnalysisPanel from './components/AnalysisPanel';
import HistoryPanel from './components/HistoryPanel';
import './App.css';
import { Bot } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setHistory(res.data.history || []);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const handleAnalyze = async (newCode, newLanguage) => {
    setCode(newCode);
    setLanguage(newLanguage);
    setIsLoading(true);
    setAnalysis(null);
    
    try {
      const res = await axios.post(`${API_BASE}/analyze`, {
        code: newCode,
        language: newLanguage
      });
      setAnalysis(res.data.analysis);
      // Refresh history after analysis
      setTimeout(fetchHistory, 1000);
    } catch (err) {
      console.error('Analysis failed', err);
      setAnalysis({
        summary: 'Error',
        explanation: 'Failed to analyze code. Make sure backend and ChromaDB are running.',
        issues: [],
        suggestions: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (item) => {
    setCode(item.metadata.code || '');
    setLanguage(item.metadata.language || '');
    setAnalysis({
      summary: item.metadata.summary,
      explanation: item.metadata.explanation,
      issues: item.metadata.issues ? JSON.parse(item.metadata.issues) : [],
      suggestions: item.metadata.suggestions ? JSON.parse(item.metadata.suggestions) : []
    });
  };

  return (
    <div className="app-container">
      <HistoryPanel history={history} onLoad={loadFromHistory} />
      
      <div className="main-content">
        <header>
          <h1><Bot style={{marginRight: 8, verticalAlign: 'middle'}}/> Multimodel Analyzer</h1>
        </header>

        <div className="editor-analysis-grid">
          <CodeEditor 
            onAnalyze={handleAnalyze} 
            isLoading={isLoading}
            initialCode={code}
            initialLanguage={language}
          />
          <AnalysisPanel analysis={analysis} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export default App;
