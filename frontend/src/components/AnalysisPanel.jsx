import { useState } from 'react';
import { Activity, Lightbulb, AlertTriangle, FileText, Copy, Check } from 'lucide-react';
import './AnalysisPanel.css';

const TABS = [
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'explanation', label: 'Explanation', icon: Activity },
  { id: 'issues', label: 'Issues', icon: AlertTriangle },
  { id: 'suggestions', label: 'Suggestions', icon: Lightbulb }
];

function AnalysisPanel({ analysis, isLoading }) {
  const [activeTab, setActiveTab] = [useState('summary')[0], useState('summary')[1]];
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!analysis) return;
    const textToCopy = JSON.stringify(analysis, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="glass-panel analysis-panel loading-state">
        <div className="pulse-loader"></div>
        <p>Analyzing your code with AI...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="glass-panel analysis-panel empty-state">
        <Activity size={48} className="empty-icon" />
        <p>Awaiting code for analysis...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel analysis-panel">
      <div className="analysis-header">
        <div className="tabs">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <button className="icon-btn" onClick={handleCopy} title="Copy Analysis">
          {copied ? <Check size={18} color="var(--success)"/> : <Copy size={18} />}
        </button>
      </div>

      <div className="analysis-content">
        {activeTab === 'summary' && (
          <div className="content-section">
            <h3>Overview</h3>
            <p className="summary-text">{analysis.summary}</p>
          </div>
        )}

        {activeTab === 'explanation' && (
          <div className="content-section">
            <h3>Detailed Explanation</h3>
            <div className="prose-content">{analysis.explanation}</div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="content-section">
            <h3>Potential Issues</h3>
            {(!analysis.issues || analysis.issues.length === 0) ? (
              <p className="success-text">No significant issues found.</p>
            ) : (
              <ul className="issue-list">
                {analysis.issues.map((issue, i) => (
                  <li key={i}><AlertTriangle size={16} className="text-warning"/> {issue}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="content-section">
            <h3>Improvement Suggestions</h3>
            {(!analysis.suggestions || analysis.suggestions.length === 0) ? (
              <p>No further suggestions.</p>
            ) : (
              <ul className="suggestion-list">
                {analysis.suggestions.map((suggestion, i) => (
                  <li key={i}><Lightbulb size={16} className="text-accent"/> {suggestion}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalysisPanel;
