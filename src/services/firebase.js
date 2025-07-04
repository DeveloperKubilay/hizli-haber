import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

const firebaseConfig = {
  apiKey: "AIzaSyDQXSR04kbpK7-F9VcmShlIELRgdvNCpQI",
  authDomain: "hizli-haber-f1210.firebaseapp.com",
  projectId: "hizli-haber-f1210",
  storageBucket: "hizli-haber-f1210.firebasestorage.app",
  messagingSenderId: "866369173209",
  appId: "1:866369173209:web:7d6d33f6227806379370c8",
  measurementId: "G-68TXK5W44Z"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });//gemma-3-27b-it

async function sendMessageToModel(message = "Hello") {
  try {
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error communicating with Gemini model:", error);
    return "Bir sorundan dolayı cevap veremiyorum. Mesajın uzunluğundan dolayı olabilir.";
  }
}

/**
 * Haberleri like/dislike sayılarını verimli şekilde yükler
 * @param {Array} newsItems - Firebase'den çekilen haber öğeleri
 * @returns {Array} - Like/dislike sayıları eklenmiş haber öğeleri
 */
async function loadNewsInteractions(newsItems) {
  try {
    // Eğer haber yoksa boş dizi döndür
    if (!newsItems || newsItems.length === 0) return [];
    
    // Daha verimli yaklaşım 1: Haberin kendi dökümanında like/dislike sayılarını kontrol et
    const newsWithCounts = await Promise.all(
      newsItems.map(async (newsItem) => {
        // Varsayılan olarak nesne üzerindeki değerleri kullan (eğer varsa)
        let likes = newsItem.likeCount || 0;
        let dislikes = newsItem.dislikeCount || 0;
        
        // Eğer haberde like/dislike sayıları yoksa, koleksiyonların boyutlarını al
        if ((likes === 0 && dislikes === 0) || (likes === undefined && dislikes === undefined)) {
          try {
            // Bu, veri geçiş süreci için: eski sistemden yeni sisteme geçerken
            // Like sayısını al
            const likesRef = collection(db, 'news', newsItem.id, 'likes');
            const likesSnapshot = await getDocs(likesRef);
            likes = likesSnapshot.size;

            // Dislike sayısını al
            const dislikesRef = collection(db, 'news', newsItem.id, 'dislikes');
            const dislikesSnapshot = await getDocs(dislikesRef);
            dislikes = dislikesSnapshot.size;
            
            // Haberin dökümanını güncelleyerek, sayaçları ana döküman içine kaydet
            // Bu sayede bir sonraki çağrıda, koleksiyonları kontrol etmemize gerek kalmaz
            try {
              const newsRef = doc(db, 'news', newsItem.id);
              await updateDoc(newsRef, {
                likeCount: likes,
                dislikeCount: dislikes,
                updatedAt: new Date()
              });
            } catch (updateError) {
              console.error(`Haber ${newsItem.id} için sayaçlar güncellenirken hata:`, updateError);
            }
          } catch (error) {
            console.error(`Haber ${newsItem.id} için like/dislike sayıları alınamadı:`, error);
          }
        }
        
        return {
          ...newsItem,
          likes,
          dislikes
        };
      })
    );
    
    return newsWithCounts;
  } catch (error) {
    console.error('Haber etkileşimleri yüklenirken hata:', error);
    // Hata durumunda orijinal haberleri döndür
    return newsItems;
  }
}

export { db, auth, analytics, model, sendMessageToModel as ai, loadNewsInteractions };
