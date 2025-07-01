import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Newspaper } from "lucide-react";

function ActionButtons() {
  return (
    <div className='flex flex-wrap justify-center gap-5 mt-10'>
      <Link to="/haberler">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className='text-black cursor-pointer text-lg bg-secondary hover:bg-secondaryHover hover:font-extrabold px-7 py-4 rounded-full font-bold flex items-center gap-3 shadow-xl transition-all duration-500 min-w-[180px] justify-center'
        >
          <Compass className="h-6 w-6" />
          Son haber
        </motion.div>
      </Link>
      <Link to="/haberler">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className='border-2 cursor-pointer text-lg border-textPrimary hover:border-textHeading px-7 py-4 rounded-full flex items-center gap-3 shadow-lg transition-all duration-500 min-w-[180px] justify-center font-bold'
        >
          <Newspaper className="h-6 w-6" />
          Tüm Haberler
        </motion.div>
      </Link>
    </div>
  );
}

export default ActionButtons;
