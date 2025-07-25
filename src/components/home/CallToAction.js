import React from 'react';
import { motion } from 'framer-motion';

function CallToAction() {
  return (
    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Arka plan resmi */}
      <img 
        src="/imgs/logo.png" 
        alt="Test"
        className="absolute inset-0 w-full h-full object-contain opacity-30"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)'
        }}
      />
      
      <div className="relative z-10 text-center px-4 sm:px-8 max-w-4xl">
        <p className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-4">
          Daha fazlası için
        </p>
        <p className="text-green-400 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-8">
          Hızlı Haber
        </p>
        
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.3 }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg text-sm md:text-base transition-colors duration-500 shadow-lg"
          onClick={() => window.location.href = '/haberler'}
        >
          Siteyi Ziyaret Et
        </motion.button>
      </div>
    </div>
  );
}

export default CallToAction;
