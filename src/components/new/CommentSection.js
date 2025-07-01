import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, User, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import { auth, db } from '../../services/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, increment } from 'firebase/firestore';

function CommentSection({ newsId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // Yorumları yükle
  const fetchComments = useCallback(async () => {
    try {
      setCommentsLoading(true);
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef,
        where('newsId', '==', newsId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const commentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setComments(commentsData);
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
    } finally {
      setCommentsLoading(false);
    }
  }, [newsId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Yorum gönder
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert('Yorum yapmak için giriş yapmalısınız');
      return;
    }

    if (!newComment.trim()) {
      alert('Lütfen bir yorum yazın');
      return;
    }

    try {
      setLoading(true);
      
      const commentData = {
        newsId,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        userName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0
      };

      await addDoc(collection(db, 'comments'), commentData);
      setNewComment('');
      fetchComments(); // Yorumları yeniden yükle
      
    } catch (error) {
      console.error('Yorum gönderilirken hata:', error);
      alert('Yorum gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Yorum beğen/beğenme
  const handleCommentLike = async (commentId, isLike) => {
    if (!auth.currentUser) {
      alert('Beğenmek için giriş yapmalısınız');
      return;
    }

    try {
      const commentDoc = doc(db, 'comments', commentId);
      const updateField = isLike ? 'likes' : 'dislikes';
      
      await updateDoc(commentDoc, {
        [updateField]: increment(1)
      });
      
      fetchComments(); // Yorumları yeniden yükle
    } catch (error) {
      console.error('Yorum beğeni işleminde hata:', error);
    }
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now - date;
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInMinutes < 1) return 'Şimdi';
      if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
      if (diffInHours < 24) return `${diffInHours} saat önce`;
      if (diffInDays < 7) return `${diffInDays} gün önce`;
      
      return date.toLocaleDateString('tr-TR');
    } catch (error) {
      return 'Bilinmiyor';
    }
  };

  return (
    <div className="bg-primary p-6 rounded-lg mb-8">
      <div className="flex items-center gap-3 mb-4">
        <MessageCircle className="text-secondary" size={24} />
        <h3 className="text-xl font-bold text-textHeading">Yorumlar ({comments.length})</h3>
      </div>
      
      {/* Yorum yazma formu */}
      {auth.currentUser ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Yorumunuzu yazın..."
                className="w-full px-4 py-3 bg-primaryBG text-textPrimary rounded-lg border border-primaryBG focus:border-secondary focus:outline-none resize-none"
                rows="3"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="bg-secondary hover:bg-secondaryHover text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Send size={16} />
                  {loading ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-primaryBG rounded-lg text-center">
          <p className="text-textPrimary">Yorum yapmak için giriş yapmalısınız.</p>
        </div>
      )}

      {/* Yorumlar listesi */}
      <div className="space-y-4">
        {commentsLoading ? (
          // Skeleton loading
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primaryBG rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-primaryBG rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-primaryBG rounded w-full mb-1"></div>
                  <div className="h-3 bg-primaryBG rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 pb-4 border-b border-primaryBG last:border-b-0">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-textHeading text-sm">
                    {comment.userName}
                  </h4>
                  <span className="text-xs text-textPrimary">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-textPrimary mb-2 text-sm leading-relaxed">
                  {comment.content}
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleCommentLike(comment.id, true)}
                    className="flex items-center gap-1 text-xs text-textPrimary hover:text-secondary transition-colors"
                  >
                    <ThumbsUp size={14} />
                    {comment.likes || 0}
                  </button>
                  <button
                    onClick={() => handleCommentLike(comment.id, false)}
                    className="flex items-center gap-1 text-xs text-textPrimary hover:text-red-500 transition-colors"
                  >
                    <ThumbsDown size={14} />
                    {comment.dislikes || 0}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-textPrimary text-sm text-center py-4">
            Henüz yorum yapılmamış. İlk yorumu siz yapın!
          </p>
        )}
      </div>
    </div>
  );
}

export default CommentSection;

