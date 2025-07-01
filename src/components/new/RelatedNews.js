import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, FileText, Heart, ThumbsDown, Calendar } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_ICONS, translateTagsToTurkish } from '../../services/categories';

function RelatedNews({ relatedNews, relatedLoading, formatDate, currentNews }) {
  return (
    <div className="space-y-6">
      {/* Haber Resmi ve Bilgiler */}
      <div className="bg-primary p-6 rounded-lg">
        <div className="w-full h-48 bg-primaryBG rounded-lg overflow-hidden flex items-center justify-center mb-4">
          {currentNews?.image ? (
            <img
              src={currentNews.image}
              alt={currentNews.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/imgs/logo.png";
              }}
            />
          ) : (
            <img
              src="/imgs/logo.png"
              alt="Site Logosu"
              className="w-32 h-32 object-contain opacity-60"
            />
          )}
        </div>
        
        {/* Like/Dislike ve Tarih */}
        <div className="space-y-3">
          {/* Like/Dislike Butonları */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-textPrimary">
              <Heart size={18} className="text-red-500" />
              <span className="font-medium">{currentNews?.likes || 0} Beğeni</span>
            </div>
            <div className="flex items-center gap-2 text-textPrimary">
              <ThumbsDown size={18} className="text-blue-500" />
              <span className="font-medium">{currentNews?.dislikes || 0} Beğenmeme</span>
            </div>
          </div>
          
          {/* Tarih */}
          <div className="flex items-center gap-2 text-textPrimary">
            <Calendar size={18} className="text-secondary" />
            <span className="font-medium">{formatDate(currentNews?.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Etiketler */}
      {currentNews?.tag && currentNews.tag.length > 0 && (
        <div className="bg-primary p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="text-secondary" size={20} />
            <h3 className="text-lg font-bold text-textHeading">Etiketler</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {translateTagsToTurkish(currentNews.tag).map((category, index) => (
              <span
                key={index}
                className={`text-sm px-3 py-2 rounded-full inline-flex items-center gap-1.5 ${CATEGORY_COLORS[category] || 'bg-primaryBG text-textPrimary'}`}
              >
                {CATEGORY_ICONS[category]} {category}
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
