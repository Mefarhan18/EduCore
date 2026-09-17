import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingAnimation from './TypingAnimation';

const ChatWindow = ({ messages, isTyping }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <span className="text-4xl">👋</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">How can I help you today?</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Ask me any academic doubts, coding questions, or upload your PDF notes for a summary or explanation!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg.text} isAi={msg.isAi} />
      ))}
      {isTyping && <TypingAnimation />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;
