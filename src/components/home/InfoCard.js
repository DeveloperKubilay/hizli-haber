import React from 'react';
import { motion } from 'framer-motion';

// Normal kart - Sol yazı, sağ fotoğraf
export function InfoCard({ title, description, image, index }) {
  return (
    <motion.div 
      className="flex items-center justify-between bg-white rounded-xl shadow-lg p-6 mb-6 mx-4"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
    >
      {/* Sol taraf - Yazı */}
      <div className="flex-1 pr-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 text-lg leading-relaxed">{description}</p>
      </div>
      
      {/* Sağ taraf - Fotoğraf */}
      <div className="flex-shrink-0">
        <img 
          src={image} 
          alt={title}
          className="w-48 h-32 object-cover rounded-lg shadow-md"
        />
      </div>
    </motion.div>
  );
}

// Ters kart - Sol fotoğraf, sağ yazı
export function InfoCardReverse({ title, description, image, index }) {
  return (
    <motion.div 
      className="flex items-center justify-between bg-white rounded-xl shadow-lg p-6 mb-6 mx-4"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
    >
      {/* Sol taraf - Fotoğraf */}
      <div className="flex-shrink-0">
        <img 
          src={image} 
          alt={title}
          className="w-48 h-32 object-cover rounded-lg shadow-md"
        />
      </div>
      
      {/* Sağ taraf - Yazı */}
      <div className="flex-1 pl-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 text-lg leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
