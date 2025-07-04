import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';

function AdSidebar({ isMobile = false }) {
  return (
    <motion.div 
      className={`${isMobile ? 'w-full' : 'w-[250px] sm:w-[280px] md:w-[320px]'} flex-shrink-0`}
      initial={{ opacity: 0, [isMobile ? 'y' : 'x']: isMobile ? 30 : -100 }}
      animate={{ opacity: 1, [isMobile ? 'y' : 'x']: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
    >
      <div className={`bg-primary p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg ${!isMobile ? 'sticky top-6' : ''}`}>
        <div className="text-center text-textPrimary">
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
            <Megaphone size={isMobile ? 18 : 22} className="text-textHeading" />
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-textHeading">Reklam Alanı</h3>
          </div>
          <div className={`bg-primaryBG rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 ${isMobile ? 'min-h-[150px] sm:min-h-[200px]' : 'min-h-[350px] sm:min-h-[450px] md:min-h-[500px]'} flex items-center justify-center`}>
            <p className="text-textPrimary text-xs sm:text-sm md:text-base">Buraya reklam gelecek!</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AdSidebar;
