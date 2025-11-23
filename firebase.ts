import { initializeApp } from "firebase/app";
// [MODIFIKASI] Import tambahan untuk persistensi React Native
import { 
  initializeAuth, 
  getReactNativePersistence,
  signInAnonymously, 
  onAuthStateChanged,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot 
} from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

// [MODIFIKASI] Import AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyARi7MyesPtBR-Xcij3EyFrgbQVLu0248A",
  authDomain: "chatapp-d8e05.firebaseapp.com",
  projectId: "chatapp-d8e05",
  storageBucket: "chatapp-d8e05.firebasestorage.app",
  messagingSenderId: "1009459871570",
  appId: "1:1009459871570:web:92d213c583e20844d5848b"
};

const app = initializeApp(firebaseConfig);

// [MODIFIKASI PENTING] 
// Jangan pakai getAuth(app) biasa. Gunakan ini agar login tersimpan saat app di-kill:
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const storage = getStorage(app); 
const messagesCollection = collection(db, "messages");

export { 
    auth, 
    db, 
    storage,
    messagesCollection, 
    signInAnonymously, 
    onAuthStateChanged,
    addDoc, 
    serverTimestamp, 
    query, 
    orderBy, 
    onSnapshot,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
};