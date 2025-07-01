import React from 'react';
import { motion } from 'framer-motion';
import NewsCard from './NewsCard';
import { Search, FileText, Trash2, Clock } from 'lucide-react';

function NewsGrid({ news, loading, searchTerm, selectedCategory, onClearSearch }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex items-center gap-3 text-xl text-gray-500">
          <Clock size={24} className="animate-spin" />
          Haberler yükleniyor...
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-xl text-textPrimary">
          {searchTerm ? 
            <>
              <Search size={48} className="mx-auto mb-4 text-textPrimary opacity-50" />
              "{searchTerm}" için sonuç bulunamadı
            </> :
            <>
              <FileText size={48} className="mx-auto mb-4 text-textPrimary opacity-50" />
              {selectedCategory === 'Tümü' ? 'Henüz haber yok' : `${selectedCategory} kategorisinde haber bulunamadı`}
            </>
          }
        </div>
        {searchTerm && (
          <button
            onClick={onClearSearch}
            className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryHover transition-colors flex items-center gap-2 mx-auto"
          >
            <Trash2 size={16} />
            Aramayı temizle
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {news.map((item, index) => (
        <NewsCard key={item.id} item={item} index={index} />
      ))}
    </motion.div>
  );
}

export default NewsGrid;
