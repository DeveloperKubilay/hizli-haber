import React from 'react';
import { motion } from 'framer-motion';

function NewsImage({ image, name }) {
  if (!image) return null;

  return (
    <motion.div 
      className="mb-8"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.img 
        src={image} 
        alt={name}
        className="w-full h-64 lg:h-96 object-cover rounded-lg shadow-lg"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    </motion.div>
  );
}

export default NewsImage;
