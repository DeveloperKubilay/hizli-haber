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
      className="prose prose-sm sm:prose-base md:prose-lg max-w-none mb-6 md:mb-10"
      initial={{ y: 30, opacity: 0 }}
      animate={controls}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Ayırıcı çizgi */}
      <motion.div 
        className="border-t-2 border-secondary/30 mb-4 sm:mb-6 md:mb-8"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      ></motion.div>
      
      <motion.div 
        className="text-textPrimary leading-relaxed markdown-content space-y-4 sm:space-y-6"
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
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-textHeading mb-4 sm:mb-6 md:mb-10 mt-6 sm:mt-8 md:mt-12" 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                {...props} 
              />
            ),
            // eslint-disable-next-line jsx-a11y/heading-has-content
            h2: ({node, ...props}) => (
              <motion.h2 
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-textHeading mb-4 sm:mb-6 md:mb-8 mt-5 sm:mt-7 md:mt-10" 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                {...props} 
              />
            ),
            // eslint-disable-next-line jsx-a11y/heading-has-content
            h3: ({node, ...props}) => (
              <motion.h3 
                className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-textHeading mb-3 sm:mb-4 md:mb-6 mt-4 sm:mt-6 md:mt-8" 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                {...props} 
              />
            ),
            p: ({node, ...props}) => (
              <motion.p 
                className="mb-3 sm:mb-4 md:mb-6 text-textPrimary leading-relaxed text-sm sm:text-base" 
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
                className="list-disc list-inside mb-3 sm:mb-4 space-y-0.5 sm:space-y-1 text-sm sm:text-base" 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                {...props} 
              />
            ),
            ol: ({node, ...props}) => (
              <motion.ol 
                className="list-decimal list-inside mb-3 sm:mb-4 space-y-0.5 sm:space-y-1 text-sm sm:text-base" 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                {...props} 
              />
            ),
            li: ({node, ...props}) => (
              <motion.li 
                className="text-textPrimary text-sm sm:text-base" 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                whileHover={{ x: 5 }}
                {...props} 
              />
            ),
            blockquote: ({node, ...props}) => (
              <motion.blockquote 
                className="border-l-4 border-secondary pl-2 sm:pl-4 italic mb-3 sm:mb-4 text-sm sm:text-base" 
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
                className="text-secondary hover:underline text-sm sm:text-base" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                {...props} 
              />
            ),
            code: ({node, ...props}) => (
              <motion.code 
                className="bg-primaryBG px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm" 
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
