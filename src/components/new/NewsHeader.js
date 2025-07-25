import React from 'react';
import { motion } from 'framer-motion';

function NewsHeader({ news, formatDate }) {
  return (
    <div className="mb-4 md:mb-6">
      <motion.h1 
        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-textHeading mb-2 md:mb-4 leading-tight"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {news.name}
      </motion.h1>
      
      {/* Kısa açıklama */}
      <motion.p 
        className="text-sm sm:text-base md:text-lg text-textPrimary mb-2 md:mb-4 leading-relaxed"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        {news.minides}
      </motion.p>
    </div>
  );
}

export default NewsHeader;
