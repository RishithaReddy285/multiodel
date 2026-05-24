import { Clock, Code } from 'lucide-react';
import './HistoryPanel.css';

function HistoryPanel({ history, onLoad }) {
  return (
    <div className="history-sidebar glass-panel">
      <div className="history-header">
        <Clock size={18} />
        <h2>History</h2>
      </div>
      
      <div className="history-list">
        {history.length === 0 ? (
          <div className="history-empty">No past analyses found.</div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id} 
              className="history-item"
              onClick={() => onLoad(item)}
            >
              <div className="item-lang">
                <Code size={14} /> 
                {item.metadata.language || 'Unknown'}
              </div>
              <div className="item-summary" title={item.metadata.summary}>
                {item.metadata.summary}
              </div>
              <div className="item-time">
                {new Date(item.metadata.timestamp).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HistoryPanel;
