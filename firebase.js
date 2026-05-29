import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyAIUxR_AIIANOfQ-h1Dt-q8bmuR-5y8q6Y",
  authDomain: "saidverasite.firebaseapp.com",
  projectId: "saidverasite",
  storageBucket: "saidverasite.firebasestorage.app",
  messagingSenderId: "68859845099",
  appId: "1:68859845099:web:c22eff44e51d44ef25a1ae",
  measurementId: "G-TYMG0CSRL2"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
