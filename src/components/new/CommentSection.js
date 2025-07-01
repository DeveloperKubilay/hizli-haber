import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.div 
      className="bg-primary p-5 md:p-6 rounded-lg mb-8 max-w-none w-full"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="flex items-center gap-3 mb-6"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <MessageCircle className="text-secondary" size={26} />
        </motion.div>
        <h3 className="text-xl md:text-2xl font-bold text-textHeading">
          Yorumlar ({comments.length})
        </h3>
      </motion.div>
      
      {/* Yorum yazma formu */}
      {auth.currentUser ? (
        <motion.form 
          onSubmit={handleSubmitComment} 
          className="mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex gap-3">
            <motion.div 
              className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="text-white" size={20} />
            </motion.div>
            <div className="flex-1">
              <motion.textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Yorumunuzu yazın..."
                className="w-full px-5 py-4 bg-primaryBG text-textPrimary rounded-lg border border-primaryBG focus:border-secondary focus:outline-none resize-none text-base"
                rows="4"
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              />
              <div className="flex justify-end mt-2">
                <motion.button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="bg-secondary hover:bg-secondaryHover text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div
                    animate={loading ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: loading ? Infinity : 0 }}
                  >
                    <Send size={16} />
                  </motion.div>
                  {loading ? 'Gönderiliyor...' : 'Gönder'}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.form>
      ) : (
        <motion.div 
          className="mb-6 p-4 bg-primaryBG rounded-lg text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-textPrimary">Yorum yapmak için giriş yapmalısınız.</p>
        </motion.div>
      )}

      {/* Yorumlar listesi */}
      <motion.div 
        className="space-y-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {commentsLoading ? (
          // Skeleton loading
          Array.from({ length: 3 }).map((_, index) => (
            <motion.div 
              key={index} 
              className="animate-pulse"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primaryBG rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-primaryBG rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-primaryBG rounded w-full mb-1"></div>
                  <div className="h-3 bg-primaryBG rounded w-3/4"></div>
                </div>
              </div>
            </motion.div>
          ))
        ) : comments.length > 0 ? (
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div 
                key={comment.id} 
                className="flex gap-3 pb-4 border-b border-primaryBG last:border-b-0"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 30, opacity: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ x: 5, scale: 1.02 }}
              >
                <motion.div 
                  className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User className="text-white" size={20} />
                </motion.div>
                <div className="flex-1">
                  <motion.div 
                    className="flex items-center gap-2 mb-1"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="font-semibold text-textHeading text-sm">
                      {comment.userName}
                    </h4>
                    <span className="text-xs text-textPrimary">
                      {formatDate(comment.createdAt)}
                    </span>
                  </motion.div>
                  <motion.p 
                    className="text-textPrimary mb-2 text-sm leading-relaxed"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {comment.content}
                  </motion.p>
                  <motion.div 
                    className="flex items-center gap-4"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.button
                      onClick={() => handleCommentLike(comment.id, true)}
                      className="flex items-center gap-1 text-xs text-textPrimary hover:text-secondary transition-colors"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ThumbsUp size={14} />
                      <motion.span
                        key={comment.likes || 0}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                      >
                        {comment.likes || 0}
                      </motion.span>
                    </motion.button>
                    <motion.button
                      onClick={() => handleCommentLike(comment.id, false)}
                      className="flex items-center gap-1 text-xs text-textPrimary hover:text-red-500 transition-colors"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ThumbsDown size={14} />
                      <motion.span
                        key={comment.dislikes || 0}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                      >
                        {comment.dislikes || 0}
                      </motion.span>
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.p 
            className="text-textPrimary text-sm text-center py-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Henüz yorum yapılmamış. İlk yorumu siz yapın!
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}

export default CommentSection;

