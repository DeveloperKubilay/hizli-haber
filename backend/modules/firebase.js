// 🔥 Client SDK
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc, updateDoc } = require('firebase/firestore');

// 👑 Admin SDK
const admin = require("firebase-admin");

// 🎯 Admin SDK için config - gizli değerler env'den, sabitler hardcoded
const adminConfig = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: "102768340742011797999", // Sabit değer
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40hizli-haber-f1210.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Client konfigürasyonu - API key env'den, diğer değerler sabit
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "hizli-haber-f1210.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: "hizli-haber-f1210.firebasestorage.app",
  messagingSenderId: "866369173209",
  appId: "1:866369173209:web:7d6d33f6227806379370c8",
  measurementId: "G-68TXK5W44Z"
};

// 🔑 Admin SDK başlatma
admin.initializeApp({
  credential: admin.credential.cert(adminConfig)
});
const adminDb = admin.firestore();
adminDb.settings({ ignoreUndefinedProperties: true });

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