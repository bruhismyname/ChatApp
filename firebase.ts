import { initializeApp } from "firebase/app";
import { 
  initializeAuth, 
  getReactNativePersistence,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
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

// Auth dengan persistensi AsyncStorage untuk auto-login
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