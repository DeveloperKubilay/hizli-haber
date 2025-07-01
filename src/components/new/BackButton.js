import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

function BackButton({ navigate }) {
  return (
    <div className="mb-6">
      <motion.button
        onClick={() => navigate('/haberler')}
        className="flex items-center gap-2 text-textPrimary hover:text-textHeading transition-colors"
        whileHover={{ 
          x: -5,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          whileHover={{ 
            x: -3,
            transition: { duration: 0.2 }
          }}
        >
          <ArrowLeft size={20} />
        </motion.div>
        Haberlere Dön
      </motion.button>
    </div>
  );
}

export default BackButton;
