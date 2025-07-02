require("dotenv").config({ path: "../.env" });

const firebase = require("../modules/firebase");

const likeNews = async (newsId, userId) => {
  const db = firebase.admin.firestore();
  const likeRef = db.collection('news').doc(newsId).collection('likes').doc(userId);
  const dislikeRef = db.collection('news').doc(newsId).collection('dislikes').doc(userId);
  console.log("Like ref:", likeRef.path);

  await dislikeRef.delete();
  await likeRef.set({ likedAt: new Date() });
}

const dislikeNews = async (newsId, userId) => {
  const db = firebase.admin.firestore();
  const likeRef = db.collection('news').doc(newsId).collection('likes').doc(userId);
  const dislikeRef = db.collection('news').doc(newsId).collection('dislikes').doc(userId);

  await likeRef.delete();
  await dislikeRef.set({ dislikedAt: new Date() });
}

module.exports = { likeNews, dislikeNews };