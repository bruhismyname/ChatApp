import { initializeApp } from "firebase/app";
import { 
  initializeAuth, 
  getReactNativePersistence,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  setDoc,
  getDocs,
  where
} from "firebase/firestore";
import { getStorage } from "firebase/storage"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const storage = getStorage(app); 

const messagesCollection = collection(db, "messages");
const usersCollection = collection(db, "users"); 

export { 
  auth, 
  db, 
  storage,
  messagesCollection,
  usersCollection, 
  onAuthStateChanged,
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  doc,
  setDoc,
  getDocs,
  where
};