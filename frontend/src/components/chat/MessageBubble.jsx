import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import remarkGfm from 'remark-gfm';

const MessageBubble = ({ message, isAi }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full ${isAi ? 'justify-start' : 'justify-end'} mb-6 group`}>
      <div className={`flex max-w-[85%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg
          ${isAi ? 'bg-gradient-to-br from-indigo-500 to-purple-600 mr-4' : 'bg-gradient-to-br from-blue-400 to-blue-600 ml-4'}`}
        >
          {isAi ? <Bot size={20} className="text-white" /> : <User size={20} className="text-white" />}
        </div>

        {/* Message Content */}
        <div className={`relative px-6 py-4 rounded-2xl shadow-md backdrop-blur-sm
          ${isAi 
            ? 'bg-white/80 dark:bg-gray-800/80 rounded-tl-none border border-gray-100 dark:border-gray-700' 
            : 'bg-indigo-600 text-white rounded-tr-none'
          }`}
        >
          {isAi && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copy to clipboard"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          )}

          <div className="max-w-none text-sm md:text-base">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p({ children }) {
                  return <p className={`mb-3 last:mb-0 leading-relaxed ${isAi ? 'text-gray-800 dark:text-gray-100' : 'text-white'}`}>{children}</p>;
                },
                h1({ children }) {
                  return <h1 className={`text-xl font-bold mt-4 mb-2 ${isAi ? 'text-indigo-900 dark:text-indigo-300' : 'text-white'}`}>{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className={`text-lg font-bold mt-3 mb-2 ${isAi ? 'text-indigo-900 dark:text-indigo-300' : 'text-white'}`}>{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className={`text-base font-bold mt-3 mb-1 ${isAi ? 'text-indigo-900 dark:text-indigo-300' : 'text-white'}`}>{children}</h3>;
                },
                ul({ children }) {
                  return <ul className={`list-disc pl-5 mb-3 space-y-1 ${isAi ? 'text-gray-800 dark:text-gray-100' : 'text-white'}`}>{children}</ul>;
                },
                ol({ children }) {
                  return <ol className={`list-decimal pl-5 mb-3 space-y-1 ${isAi ? 'text-gray-800 dark:text-gray-100' : 'text-white'}`}>{children}</ol>;
                },
                li({ children }) {
                  return <li className="mb-0.5">{children}</li>;
                },
                strong({ children }) {
                  return <strong className={`font-semibold ${isAi ? 'text-indigo-950 dark:text-indigo-200' : 'text-white font-bold'}`}>{children}</strong>;
                },
                em({ children }) {
                  return <em className="italic">{children}</em>;
                },
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg my-2 !bg-gray-900"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={`${inline ? 'bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono' : ''} ${isAi ? 'text-indigo-600 dark:text-indigo-300 font-semibold' : 'text-indigo-100'}`} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
