import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
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
    return "Error generating response";
  }
}

export { db, auth, analytics, model, sendMessageToModel as ai };
