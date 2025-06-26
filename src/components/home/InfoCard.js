import React from 'react';
import { motion } from 'framer-motion';

// Normal kart - Sol yazı, sağ fotoğraf
export function InfoCard({ title, description, image, index }) {
  return (
    <motion.div 
      className="flex items-stretch bg-transparent rounded-xl mb-36 mx-4 overflow-hidden h-[500px] gap-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
    >
      {/* Sol taraf - Yazı (50%) */}
      <div className="w-1/2 p-8 flex flex-col justify-center">
        <h3 className="text-6xl font-bold text-white mb-4 leading-tight">{title}</h3>
        <p className="text-white text-xl leading-relaxed">{description}</p>
      </div>
      
      {/* Sağ taraf - Fotoğraf (45%) */}
      <div className="w-[45%]">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    </motion.div>
  );
}

// Ters kart - Sol fotoğraf, sağ yazı
export function InfoCardReverse({ title, description, image, index }) {
  return (
    <motion.div 
      className="flex items-stretch bg-transparent rounded-xl mb-36 mx-4 overflow-hidden h-[500px] gap-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
    >
      {/* Sol taraf - Fotoğraf (45%) */}
      <div className="w-[45%]">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      
      {/* Sağ taraf - Yazı (50%) */}
      <div className="w-1/2 p-8 flex flex-col justify-center">
        <h3 className="text-6xl font-bold text-white mb-4 leading-tight">{title}</h3>
        <p className="text-white text-xl leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
