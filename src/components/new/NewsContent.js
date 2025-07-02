import React, { memo, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const NewsContent = memo(function NewsContent({ news }) {
  const content = news.des || news.content || news.description || news.minides || 'İçerik mevcut değil.';
  const controls = useAnimation();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!hasAnimated.current) {
      controls.start({ y: 0, opacity: 1 });
      hasAnimated.current = true;
    }
  }, [controls]);
  
  return (
    <motion.div 
      className="prose prose-lg max-w-none mb-10"
      initial={{ y: 30, opacity: 0 }}
      animate={controls}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Ayırıcı çizgi */}
      <motion.div 
        className="border-t-2 border-secondary/30 mb-8"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      ></motion.div>
      
      <motion.div 
        className="text-textPrimary leading-relaxed markdown-content space-y-6"
        initial={hasAnimated.current ? false : { y: 20, opacity: 0 }}
        animate={hasAnimated.current ? false : { y: 0, opacity: 1 }}
        transition={hasAnimated.current ? false : { duration: 0.6, delay: 0.3 }}
      >
        <ReactMarkdown 
          components={{
            // Markdown elementleri için özel stil
            // eslint-disable-next-line jsx-a11y/heading-has-content
            h1: ({node, ...props}) => (
              <motion.h1 
                className="text-3xl md:text-4xl font-bold text-textHeading mb-10 mt-12" 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                {...props} 
              />
            ),
            // eslint-disable-next-line jsx-a11y/heading-has-content
            h2: ({node, ...props}) => (
              <motion.h2 
                className="text-2xl md:text-3xl font-bold text-textHeading mb-8 mt-10" 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                {...props} 
              />
            ),
            // eslint-disable-next-line jsx-a11y/heading-has-content
            h3: ({node, ...props}) => (
              <motion.h3 
                className="text-xl md:text-2xl font-bold text-textHeading mb-6 mt-8" 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                {...props} 
              />
            ),
            p: ({node, ...props}) => (
              <motion.p 
                className="mb-6 text-textPrimary leading-relaxed text-base" 
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
});

export default NewsContent;
