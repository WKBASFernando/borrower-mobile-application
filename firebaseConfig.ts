import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyDU0j7mkX2aOxUQa8jSRaFb2BMeQ3pnVRA",
  authDomain: "borrower-4565c.firebaseapp.com",
  projectId: "borrower-4565c",
  storageBucket: "borrower-4565c.firebasestorage.app",
  messagingSenderId: "697423123208",
  appId: "1:697423123208:web:a08c082224d9ff29ee52bd",
  measurementId: "G-FNK8MLCE97",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
