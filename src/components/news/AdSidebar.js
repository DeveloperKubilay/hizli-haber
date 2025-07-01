import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';

function AdSidebar() {
  return (
    <motion.div 
      className="w-[250px] flex-shrink-0"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
    >
      <div className="bg-primary p-6 rounded-2xl shadow-lg sticky top-6">
        <div className="text-center text-textPrimary">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Megaphone size={20} className="text-textHeading" />
            <h3 className="text-lg font-semibold text-textHeading">Reklam Alanı</h3>
          </div>
          <div className="bg-primaryBG rounded-xl p-8 min-h-[400px] flex items-center justify-center">
            <p className="text-textPrimary">Buraya reklam gelecek!</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AdSidebar;
