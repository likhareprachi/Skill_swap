// FILE: js/auth.js
import { auth } from './firebase_config.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { showDashboard, showLogin, updateUserInfo, showView } from './ui.js';

// ... (imports remain same, just updating the line above)

// Login Function
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Logged in:", userCredential.user.email);
        // UI updates are handled by onAuthStateChanged
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login Failed: " + error.message);
    }
}

// Google Login Function
export async function loginWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log("Logged in with Google:", result.user.email);
    } catch (error) {
        console.error("Google Login Error:", error);
        alert("Google Login Failed: " + error.message);
    }
}

// Logout Function
export async function logout() {
    try {
        await signOut(auth);
        console.log("Logged out");
    } catch (error) {
        console.error("Logout Error:", error);
    }
}

// Auth State Listener
export function initAuth() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is signed in:", user.email);
            updateUserInfo(user);
            showView('about'); // Redirect to About page first
        } else {
            console.log("User is signed out");
            showLogin();
        }
    });
}
