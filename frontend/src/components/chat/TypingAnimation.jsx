import React from 'react';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

const TypingAnimation = () => {
  return (
    <div className="flex w-full justify-start mb-6">
      <div className="flex max-w-[85%] flex-row">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 mr-4">
          <Bot size={20} className="text-white" />
        </div>
        <div className="px-6 py-4 rounded-2xl rounded-tl-none bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 shadow-md backdrop-blur-sm flex items-center gap-1.5 h-12">
          <motion.div
            className="w-2 h-2 rounded-full bg-indigo-400"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-indigo-500"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-indigo-600"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingAnimation;
