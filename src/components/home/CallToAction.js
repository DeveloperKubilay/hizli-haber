import React from 'react';
import { motion } from 'framer-motion';

function CallToAction() {
  return (
    <div className="w-full h-[600px] bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Arka plan resmi */}
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/6/6a/PNG_Test.png" 
        alt="Test"
        className="absolute inset-0 w-full h-full object-contain opacity-30"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)'
        }}
      />
      
      <div className="relative z-10 text-center px-8 max-w-4xl">
        <p className="text-white text-6xl font-bold mb-4">
          Daha fazlası için
        </p>
        <p className="text-green-400 text-7xl font-bold mb-8">
          Hızlı Haber
        </p>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-base transition-colors duration-300 shadow-lg"
        >
          Siteyi Ziyaret Et
        </motion.button>
      </div>
    </div>
  );
}

export default CallToAction;
