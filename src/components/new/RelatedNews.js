import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, FileText } from 'lucide-react';

function RelatedNews({ relatedNews, relatedLoading, formatDate, currentNews }) {
  return (
    <div className="space-y-6">
      {/* Haber Resmi */}
      {currentNews?.image && (
        <div className="bg-primary p-6 rounded-lg">
          <h3 className="text-lg font-bold text-textHeading mb-4">Haber Resmi</h3>
          <img
            src={currentNews.image}
            alt={currentNews.name}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      )}

      {/* Taglar */}
      {currentNews?.tag && currentNews.tag.length > 0 && (
        <div className="bg-primary p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="text-secondary" size={20} />
            <h3 className="text-lg font-bold text-textHeading">Etiketler</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentNews.tag.map((tag, index) => (
              <span
                key={index}
                className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Özet */}
      {currentNews?.summary && (
        <div className="bg-primary p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-secondary" size={20} />
            <h3 className="text-lg font-bold text-textHeading">Özet</h3>
          </div>
          <p className="text-textPrimary leading-relaxed">
            {currentNews.summary}
          </p>
        </div>
      )}

      {/* Benzer Haberler */}
      <div className="bg-primary p-6 rounded-lg">
        <h3 className="text-xl font-bold text-textHeading mb-4">Benzer Haberler</h3>
      <div className="space-y-4">
        {relatedLoading ? (
          // Skeleton loading for related news
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-primaryBG rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-primaryBG rounded w-full mb-2"></div>
                  <div className="h-3 bg-primaryBG rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : relatedNews.length > 0 ? (
          relatedNews.map((item) => (
            <Link
              key={item.id}
              to={`/haber/${item.id}`}
              className="block group"
            >
              <div className="flex gap-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-textHeading group-hover:text-secondary transition-colors line-clamp-2">
                    {item.name}
                  </h4>
                  <p className="text-xs text-textPrimary mt-1">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-textPrimary text-sm">Benzer haber bulunamadı.</p>
        )}
      </div>
      </div>
    </div>
  );
}

export default RelatedNews;
