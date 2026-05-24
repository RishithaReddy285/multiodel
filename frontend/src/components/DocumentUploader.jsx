import { useState, useRef } from 'react';
import { UploadCloud, File, Image as ImageIcon, Code2 } from 'lucide-react';
import './DocumentUploader.css';

function DocumentUploader({ onAnalyze, isLoading }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (file) {
      onAnalyze(file);
    }
  };

  const getFileIcon = () => {
    if (!file) return <UploadCloud size={48} />;
    if (file.type.startsWith('image/')) return <ImageIcon size={48} />;
    if (file.type === 'application/pdf') return <File size={48} />;
    return <Code2 size={48} />;
  };

  return (
    <div className="glass-panel uploader-panel">
      <div className="uploader-header">
        <div className="header-title">
          <UploadCloud size={18} />
          <span>Upload Document</span>
        </div>
      </div>
      
      <div 
        className={`drag-area ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <input 
          ref={inputRef} 
          type="file" 
          className="file-input" 
          onChange={handleChange}
          accept="image/*,.pdf,.js,.py,.html,.css,.txt"
        />
        
        <div className="drag-content">
          <div className="file-icon-wrapper">
            {getFileIcon()}
          </div>
          {file ? (
            <div className="file-info">
              <h4>{file.name}</h4>
              <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <>
              <h3>Drag & drop a file here</h3>
              <p>or click to browse</p>
              <span className="file-types">Supports PDF, Images (JPG/PNG), Code, and Text files</span>
            </>
          )}
        </div>
      </div>
      
      <div className="uploader-footer">
        {file && (
          <button className="btn btn-secondary" onClick={() => setFile(null)} disabled={isLoading}>
            Clear
          </button>
        )}
        <button 
          className="btn" 
          onClick={handleAnalyze}
          disabled={isLoading || !file}
        >
          {isLoading ? (
            <span className="loading-spinner"></span>
          ) : (
            <UploadCloud size={16} />
          )}
          {isLoading ? 'Analyzing...' : 'Analyze Document'}
        </button>
      </div>
    </div>
  );
}

export default DocumentUploader;
