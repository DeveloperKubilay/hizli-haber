import React from 'react';
import { motion } from 'framer-motion';
import { CATEGORY_LIST, CATEGORY_ICONS } from '../../services/categories';

function CategoryFilter({ selectedCategory, onCategoryChange }) {
  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="bg-primary p-1 rounded-3xl shadow-lg w-fit mx-auto">
        <div className="flex flex-wrap justify-center">
          {CATEGORY_LIST.map((category, index) => (
            <motion.button
              key={category}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
              onClick={() => onCategoryChange(category)}
              className={`px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-secondaryBG text-secondary border border-secondary shadow-md hover:bg-selectBox hover:text-white'
                  : 'bg-transparent text-textPrimary hover:bg-primaryBG hover:text-textHeading border border-transparent'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {CATEGORY_ICONS[category]}
                <span>{category}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default CategoryFilter;
