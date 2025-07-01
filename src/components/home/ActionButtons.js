import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Newspaper } from "lucide-react";

function ActionButtons() {
  return (
    <div className='flex flex-wrap justify-center gap-5 mt-10'>
      <Link to="/haberler">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className='text-black cursor-pointer text-lg bg-secondary hover:bg-secondaryHover hover:font-extrabold px-7 py-4 rounded-full font-bold flex items-center gap-3 shadow-xl'
        >
          <Compass className="h-6 w-6 mr-1" />
          Son haber
        </motion.div>
      </Link>
      <Link to="/haberler">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className='border-2 cursor-pointer text-base border-textPrimary hover:border-textHeading px-5 py-3 rounded-full flex items-center gap-2 shadow-lg'
        >
          <Newspaper className="h-5 w-5 mr-1" />
          Tüm Haberler
        </motion.div>
      </Link>
    </div>
  );
}

export default ActionButtons;
