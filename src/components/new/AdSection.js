import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';

function AdSection() {
  return (
    <motion.div 
      className="bg-primary p-5 md:p-6 rounded-lg text-center w-full"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        transition: { duration: 0.2 }
      }}
    >
      <motion.div 
        className="flex items-center gap-3 mb-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Megaphone className="text-secondary" size={22} />
        <h3 className="text-lg md:text-xl font-bold text-textHeading">
          Reklam Alanı
        </h3>
      </motion.div>
      <motion.div 
        className="bg-primaryBG rounded-lg p-8 md:p-10 min-h-[220px] md:min-h-[280px] flex items-center justify-center w-full"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-textPrimary text-base md:text-lg">
          Bu alan reklam için ayrılmıştır
        </p>
      </motion.div>
    </motion.div>
  );
}

export default AdSection;
