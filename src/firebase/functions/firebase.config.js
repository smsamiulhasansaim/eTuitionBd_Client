import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDNWouuzXRdqpsha5UhvLk2tSRjsbMSRDg",
  authDomain: "etuitionbd-1be79.firebaseapp.com",
  projectId: "etuitionbd-1be79",
  storageBucket: "etuitionbd-1be79.firebasestorage.app",
  messagingSenderId: "1087466201582",
  appId: "1:1087466201582:web:10ed1a10340178ac0aeeff"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Provider Setup with Scopes
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

export { auth, googleProvider };