import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjqDjQCEGN5AIXiJzoQoAvJBR9vCyWRp4",
  authDomain: "trading-journal-aa86d.firebaseapp.com",
  projectId: "trading-journal-aa86d",
  storageBucket: "trading-journal-aa86d.firebasestorage.app",
  messagingSenderId: "528319748611",
  appId: "1:528319748611:web:f42076275093698b948c36"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
