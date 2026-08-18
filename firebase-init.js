/* ==========================================================================
   Hasatz Solutions Client Portal - Firebase SDK Initialization (js/firebase-init.js)
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Web App Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbhQxZkO-9QU4LqNZIlkCcWY8hmeloDQw",
  authDomain: "codenexa-60fc4.firebaseapp.com",
  projectId: "codenexa-60fc4",
  storageBucket: "codenexa-60fc4.firebasestorage.app",
  messagingSenderId: "71037013897",
  appId: "1:71037013897:web:510f85748620d741ed9b58",
  measurementId: "G-9JHYMW8HLB"
};

// Authorized Admin Emails
window.ADMIN_EMAILS = [
  'vikkyvikky132007@gmail.com',
  'sksathish2871@gmail.com'
];

// Initialize Firebase App & Auth
try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();

  window.HasatzFirebase = {
    app,
    auth,
    googleProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged
  };
  window.CodenexaFirebase = window.HasatzFirebase;

  console.log("🔥 Firebase initialized successfully for Hasatz Solutions Portal.");
} catch (err) {
  console.warn("Firebase initialization warning (using local fallback mode):", err);
}
