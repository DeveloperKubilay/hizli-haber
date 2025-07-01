import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

function NewsContent({ news }) {
  const content = news.des || news.content || news.description || news.minides || 'İçerik mevcut değil.';
  
  return (
    <motion.div 
      className="prose prose-lg max-w-none mb-8"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Ayırıcı çizgi */}
      <motion.div 
        className="border-t-2 border-secondary/30 mb-6"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      ></motion.div>
      
      <motion.div 
        className="text-textPrimary leading-relaxed markdown-content"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <ReactMarkdown 
          components={{
            // Markdown elementleri için özel stil
            // eslint-disable-next-line jsx-a11y/heading-has-content
            h1: ({node, ...props}) => (
              <motion.h1 
                className="text-2xl font-bold text-textHeading mb-4" 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                {...props} 
              />
            ),
            // eslint-disable-next-line jsx-a11y/heading-has-content
            h2: ({node, ...props}) => (
              <motion.h2 
                className="text-xl font-bold text-textHeading mb-3" 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                {...props} 
              />
            ),
            // eslint-disable-next-line jsx-a11y/heading-has-content
            h3: ({node, ...props}) => (
              <motion.h3 
                className="text-lg font-bold text-textHeading mb-2" 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                {...props} 
              />
            ),
            p: ({node, ...props}) => (
              <motion.p 
                className="mb-4 text-textPrimary leading-relaxed" 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                {...props} 
              />
            ),
            strong: ({node, ...props}) => (
              <motion.strong 
                className="font-bold text-textHeading" 
                whileHover={{ scale: 1.05 }}
                {...props} 
              />
            ),
            em: ({node, ...props}) => <em className="italic" {...props} />,
            ul: ({node, ...props}) => (
              <motion.ul 
                className="list-disc list-inside mb-4 space-y-1" 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                {...props} 
              />
            ),
            ol: ({node, ...props}) => (
              <motion.ol 
                className="list-decimal list-inside mb-4 space-y-1" 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                {...props} 
              />
            ),
            li: ({node, ...props}) => (
              <motion.li 
                className="text-textPrimary" 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                whileHover={{ x: 5 }}
                {...props} 
              />
            ),
            blockquote: ({node, ...props}) => (
              <motion.blockquote 
                className="border-l-4 border-secondary pl-4 italic mb-4" 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                whileHover={{ x: 5, scale: 1.02 }}
                {...props} 
              />
            ),
            // eslint-disable-next-line jsx-a11y/anchor-has-content
            a: ({node, ...props}) => (
              <motion.a 
                className="text-secondary hover:underline" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                {...props} 
              />
            ),
            code: ({node, ...props}) => (
              <motion.code 
                className="bg-primaryBG px-2 py-1 rounded text-sm" 
                whileHover={{ scale: 1.05 }}
                {...props} 
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </motion.div>
    </motion.div>
  );
}

export default NewsContent;
