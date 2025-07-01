import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';

function AdSidebar() {
  return (
    <motion.div 
      className="w-[280px] md:w-[320px] flex-shrink-0"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
    >
      <div className="bg-primary p-6 md:p-8 rounded-2xl shadow-lg sticky top-6">
        <div className="text-center text-textPrimary">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Megaphone size={22} className="text-textHeading" />
            <h3 className="text-lg md:text-xl font-semibold text-textHeading">Reklam Alanı</h3>
          </div>
          <div className="bg-primaryBG rounded-xl p-8 md:p-12 min-h-[450px] md:min-h-[500px] flex items-center justify-center">
            <p className="text-textPrimary text-sm md:text-base">Buraya reklam gelecek!</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AdSidebar;
