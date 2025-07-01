import React from 'react';
import { Calendar } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_ICONS, translateTagsToTurkish } from '../../services/categories';

function NewsHeader({ news, formatDate }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl lg:text-4xl font-bold text-textHeading mb-4 leading-tight">
        {news.name}
      </h1>
      
      {/* Kısa açıklama */}
      <p className="text-lg text-textPrimary mb-4 leading-relaxed">
        {news.minides}
      </p>

      {/* Meta bilgiler */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-textPrimary mb-6">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{formatDate(news.createdAt)}</span>
        </div>
      </div>

      {/* Kategoriler */}
      <div className="flex flex-wrap gap-2 mb-6">
        {news.tag && translateTagsToTurkish(news.tag).map((category, idx) => (
          <span key={idx} className={`text-sm px-3 py-2 rounded-full inline-flex items-center gap-1.5 ${CATEGORY_COLORS[category] || 'bg-primaryBG text-textPrimary'}`}>
            {CATEGORY_ICONS[category]} {category}
          </span>
        ))}
      </div>
    </div>
  );
}

export default NewsHeader;
