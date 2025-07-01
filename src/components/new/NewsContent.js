import React from 'react';

function NewsContent({ news }) {
  return (
    <div className="prose prose-lg max-w-none mb-8">
      <div className="text-textPrimary leading-relaxed whitespace-pre-wrap">
        {news.des || news.content || news.description || news.minides || 'İçerik mevcut değil.'}
      </div>
    </div>
  );
}

export default NewsContent;
