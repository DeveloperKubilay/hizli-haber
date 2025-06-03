import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

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

export { db, auth, analytics };
