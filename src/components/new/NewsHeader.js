import React from 'react';

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
    </div>
  );
}

export default NewsHeader;
