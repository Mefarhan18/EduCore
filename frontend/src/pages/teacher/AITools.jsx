import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import SidebarHistory from '../../components/chat/SidebarHistory';
import ChatWindow from '../../components/chat/ChatWindow';
import ChatInput from '../../components/chat/ChatInput';
import { FileText, Lightbulb, CheckSquare } from 'lucide-react';

const AITools = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchHistory(activeConversation.id);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/ai/conversations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setConversations(response.data);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };

  const fetchHistory = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/ai/history/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const formattedMsgs = response.data.flatMap(msg => [
        { text: msg.message, isAi: false },
        { text: msg.response, isAi: true }
      ]);
      setMessages(formattedMsgs);
    } catch (error) {
      console.error("Failed to fetch history", error);
    }
  };

  const handleSendMessage = async (text, file) => {
    let fileId = null;

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        setIsTyping(true);
        const uploadRes = await axios.post('http://localhost:8080/api/ai/upload', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        });
        fileId = uploadRes.data.id;
      } catch (error) {
        console.error("Upload failed", error);
        setIsTyping(false);
        return;
      }
    }

    setMessages(prev => [...prev, { text, isAi: false }]);
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:8080/api/ai/chat', {
        message: text,
        conversationId: activeConversation?.id,
        fileId: fileId
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setMessages(prev => [...prev, { text: response.data.response, isAi: true }]);
      
      if (!activeConversation) {
        fetchConversations();
        setActiveConversation({ id: response.data.conversationId, title: text.substring(0, 30) });
      }
    } catch (error) {
      console.error("Chat failed", error);
      setMessages(prev => [...prev, { text: "Sorry, I encountered an error.", isAi: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/ai/history/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (activeConversation?.id === id) {
        setActiveConversation(null);
      }
      fetchConversations();
    } catch (error) {
      console.error("Failed to delete conversation", error);
    }
  };

  const insertPrompt = (promptText) => {
    handleSendMessage(promptText, null);
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 overflow-hidden">
      <SidebarHistory 
        conversations={conversations} 
        activeId={activeConversation?.id}
        onSelect={setActiveConversation}
        onNewChat={() => setActiveConversation(null)}
        onDelete={handleDelete}
      />
      
      <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900/50 relative">
        <div className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center px-6 shadow-sm z-10">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
              Teacher AI Tools
            </span>
          </h1>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col max-w-4xl w-full mx-auto relative">
          
          {messages.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 w-full max-w-3xl mx-auto absolute top-1/4 left-0 right-0 z-0">
              <button onClick={() => insertPrompt("Generate a 10-question multiple choice quiz on Introduction to Databases.")} className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-lg transition-all hover:border-orange-300 group">
                <CheckSquare size={32} className="text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 text-center">Generate Quiz</span>
              </button>
              <button onClick={() => insertPrompt("Create a detailed lesson plan for a 45-minute class on Newton's Laws of Motion.")} className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-lg transition-all hover:border-orange-300 group">
                <FileText size={32} className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 text-center">Lesson Plan</span>
              </button>
              <button onClick={() => insertPrompt("Explain 'Object Oriented Programming' in a simple way for 8th graders.")} className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-lg transition-all hover:border-orange-300 group">
                <Lightbulb size={32} className="text-yellow-500 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 text-center">Topic Explanation</span>
              </button>
            </div>
          )}

          <div className="flex-1 z-10 w-full h-full flex flex-col">
            <ChatWindow messages={messages} isTyping={isTyping} />
            <div className="p-4 md:p-6 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent">
              <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITools;
