import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORY_LIST, CATEGORY_ICONS } from '../../services/categories';
import { ChevronDown, ChevronUp } from 'lucide-react';

function CategoryFilter({ selectedCategory, onCategoryChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Mobil görünümde ilk 3 kategoriyi göstereceğiz, geri kalanı açılır menüde olacak
  const mainCategories = CATEGORY_LIST.slice(0, 3);
  const extraCategories = CATEGORY_LIST.slice(3);
  
  return (
    <motion.div 
      className="mb-4 sm:mb-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Mobil düzen */}
      <div className="sm:hidden">
        <div className="bg-primary p-1 rounded-2xl shadow-lg w-full mx-auto">
          <div className="flex flex-wrap justify-center gap-1">
            {mainCategories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                onClick={() => onCategoryChange(category)}
                className={`px-2 py-1.5 rounded-xl text-xs font-medium flex-1 transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-secondaryBG text-secondary border border-secondary shadow-md hover:bg-selectBox hover:text-white'
                    : 'bg-transparent text-textPrimary hover:bg-primaryBG hover:text-textHeading border border-transparent'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  {CATEGORY_ICONS[category]}
                  <span>{category}</span>
                </div>
              </motion.button>
            ))}
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2 py-1.5 rounded-xl text-xs font-medium flex-1 bg-primaryBG text-textPrimary hover:bg-blackSelectHover hover:text-textHeading border border-transparent transition-all duration-200"
            >
              <div className="flex items-center justify-center gap-1">
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span>{isExpanded ? "Daha Az" : "Daha Fazla"}</span>
              </div>
            </motion.button>
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                className="pt-1.5 pb-1 px-1"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-wrap justify-center gap-1">
                  {extraCategories.map((category, index) => (
                    <motion.button
                      key={category}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
                      onClick={() => onCategoryChange(category)}
                      className={`px-2 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-secondaryBG text-secondary border border-secondary shadow-md hover:bg-selectBox hover:text-white'
                          : 'bg-transparent text-textPrimary hover:bg-primaryBG hover:text-textHeading border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {CATEGORY_ICONS[category]}
                        <span>{category}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Tablet/Desktop düzen - orijinal */}
      <div className="hidden sm:block">
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
      </div>
    </motion.div>
  );
}

export default CategoryFilter;
