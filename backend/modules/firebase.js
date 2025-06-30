// 🔥 Client SDK
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc, updateDoc } = require('firebase/firestore');

// 👑 Admin SDK
const admin = require("firebase-admin");
require('dotenv').config();

// 🎯 Admin SDK için env'den değerleri alalım
const adminConfig = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

// Client konfigürasyonu (env dosyasından alıyoruz)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// 🔑 Admin SDK başlatma
admin.initializeApp({
  credential: admin.credential.cert(adminConfig)
});
const adminDb = admin.firestore();

// Client başlatma
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


async function addToCollection(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log(`🔥 Belge eklendi! ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error(`❌ Belge eklenirken hata oluştu: ${error}`);
    throw error;
  }
}


async function addWithId(collectionName, docId, data) {
  try {
    await setDoc(doc(db, collectionName, docId), data);
    console.log(`🔥 Belge başarıyla eklendi! ID: ${docId}`);
  } catch (error) {
    console.error(`❌ Belge eklenirken hata oluştu: ${error}`);
    throw error;
  }
}

/**
 * Var olan bir belgeyi günceller
 * @param {string} collectionName - Koleksiyon adı
 * @param {string} docId - Belge ID'si
 * @param {object} data - Güncellenecek veri
 * @returns {Promise<void>}
 */
async function updateDocument(collectionName, docId, data) {
  try {
    await updateDoc(doc(db, collectionName, docId), data);
    console.log(`🔄 Belge güncellendi! ID: ${docId}`);
  } catch (error) {
    console.error(`❌ Belge güncellenirken hata oluştu: ${error}`);
    throw error;
  }
}

/**
 * Admin SDK kullanarak haberleri ekler (daha fazla yetki ile)
 * @param {string} collectionName - Koleksiyon adı
 * @param {object} data - Eklenecek veri
 * @returns {Promise<string>} - Eklenen belgenin ID'si
 */
async function addWithAdmin(collectionName, data) {
  try {
    const docRef = await adminDb.collection(collectionName).add(data);
    console.log(`👑 Admin ile belge eklendi! ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error(`💥 Admin ile belge eklenirken hata: ${error}`);
    throw error;
  }
}

module.exports = {
  db,
  adminDb, // 👑 Admin veritabanı ekledik
  admin, // 👑 Admin SDK'yı dışarı açtık
  addToCollection,
  addWithId,
  updateDocument,
  addWithAdmin // 👑 Yeni admin fonksiyonumuzu dışa aktardık
};