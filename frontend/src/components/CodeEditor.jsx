import { useState, useEffect } from 'react';
import { Play, Code2 } from 'lucide-react';
import './CodeEditor.css';

const LANGUAGES = [
  'Auto Detect', 'JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'Ruby', 'PHP', 'HTML/CSS'
];

function CodeEditor({ onAnalyze, isLoading, initialCode, initialLanguage }) {
  const [code, setCode] = useState(initialCode || '');
  const [language, setLanguage] = useState(initialLanguage || '');

  useEffect(() => {
    if (initialCode !== undefined) setCode(initialCode);
    if (initialLanguage !== undefined) setLanguage(initialLanguage);
  }, [initialCode, initialLanguage]);

  const handleAnalyze = () => {
    onAnalyze(code, language === 'Auto Detect' ? '' : language);
  };

  return (
    <div className="glass-panel editor-panel">
      <div className="editor-header">
        <div className="header-title">
          <Code2 size={18} />
          <span>Input Code</span>
        </div>
        <select 
          className="lang-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGUAGES.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      
      <textarea
        className="code-input"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code here..."
        spellCheck="false"
      />
      
      <div className="editor-footer">
        <button 
          className="btn" 
          onClick={handleAnalyze}
          disabled={isLoading || !code.trim()}
        >
          {isLoading ? (
            <span className="loading-spinner"></span>
          ) : (
            <Play size={16} />
          )}
          {isLoading ? 'Analyzing...' : 'Analyze Code'}
        </button>
      </div>
    </div>
  );
}

export default CodeEditor;
