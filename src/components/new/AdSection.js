import React from 'react';
import { motion } from 'framer-motion';

function AdSection() {
  return (
    <motion.div 
      className="bg-primary p-6 rounded-lg text-center"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        transition: { duration: 0.2 }
      }}
    >
      <motion.h3 
        className="text-lg font-bold text-textHeading mb-2"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Reklam
      </motion.h3>
      <motion.p 
        className="text-textPrimary text-sm"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Bu alan reklam için ayrılmıştır
      </motion.p>
    </motion.div>
  );
}

export default AdSection;
