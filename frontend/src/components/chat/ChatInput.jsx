import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

const ChatInput = ({ onSendMessage, onFileUpload, disabled }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((message.trim() || file) && !disabled) {
      onSendMessage(message.trim(), file);
      setMessage('');
      setFile(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Only accept PDF
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert('Please upload a PDF file.');
      }
    }
  };

  return (
    <div className="w-full relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
      {file && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-sm text-indigo-700 dark:text-indigo-300">
          <Paperclip size={16} />
          <span className="truncate flex-1 font-medium">{file.name}</span>
          <button 
            type="button" 
            onClick={() => setFile(null)}
            className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-3 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <Paperclip size={20} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="application/pdf"
          className="hidden" 
        />
        
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question or type a message..."
          disabled={disabled}
          className="flex-1 max-h-[200px] bg-transparent resize-none outline-none py-3 px-2 text-gray-700 dark:text-gray-200 placeholder-gray-400 disabled:opacity-50"
          rows={1}
        />
        
        <button
          type="submit"
          disabled={(!message.trim() && !file) || disabled}
          className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
        >
          <Send size={20} className={message.trim() || file ? 'translate-x-0.5 -translate-y-0.5' : ''} />
        </button>
      </form>
      <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-400 dark:text-gray-500">
        AI can make mistakes. Verify important information.
      </div>
    </div>
  );
};

export default ChatInput;
