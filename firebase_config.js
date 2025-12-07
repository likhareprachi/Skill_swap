// FILE: js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyBQiYYKxQ6WxWrLjniEmUHVNiN72gpBbI8",
  authDomain: "skill-swap-1-1353a.firebaseapp.com",
  databaseURL: "https://skill-swap-1-1353a-default-rtdb.firebaseio.com",
  projectId: "skill-swap-1-1353a",
  storageBucket: "skill-swap-1-1353a.firebasestorage.app",
  messagingSenderId: "800679860696",
  appId: "1:800679860696:web:bb303753454ddbec90faad",
  measurementId: "G-XDNERSSWN4"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
