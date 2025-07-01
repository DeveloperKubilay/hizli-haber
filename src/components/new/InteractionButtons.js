import React from 'react';
import { Heart, ThumbsDown, Share2, Bookmark } from 'lucide-react';

function InteractionButtons({ 
  news, 
  liked, 
  disliked, 
  handleLike, 
  handleDislike, 
  handleShare 
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 py-6 border-t border-primary">
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          liked ? 'bg-red-500 text-white' : 'bg-primary text-textPrimary hover:bg-primaryBG'
        }`}
      >
        <Heart size={20} />
        <span>{news.likes || 0}</span>
      </button>

      <button
        onClick={handleDislike}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          disliked ? 'bg-blue-500 text-white' : 'bg-primary text-textPrimary hover:bg-primaryBG'
        }`}
      >
        <ThumbsDown size={20} />
        <span>{news.dislikes || 0}</span>
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-textPrimary hover:bg-primaryBG transition-colors"
      >
        <Share2 size={20} />
        Paylaş
      </button>

      <button
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-textPrimary hover:bg-primaryBG transition-colors"
      >
        <Bookmark size={20} />
        Kaydet
      </button>
    </div>
  );
}

export default InteractionButtons;
