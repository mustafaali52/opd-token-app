import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your Firebase project configuration
// Get these values from Firebase Console > Project Settings > General
const firebaseConfig = {
  apiKey: "AIzaSyCeQc5w-cwVGR7dWmlhY2kREyG7qtu_nXI",
  authDomain: "opd-token-generate-db.firebaseapp.com",
  projectId: "opd-token-generate-db",
  storageBucket: "opd-token-generate-db.firebasestorage.app",
  messagingSenderId: "1001278712124",
  appId: "1:1001278712124:web:3cfd41d7dbe571d65f5639",
  measurementId: "G-P3XYNCBGDT"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
