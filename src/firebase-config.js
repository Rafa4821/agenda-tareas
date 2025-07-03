// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAezh2CA36_uEe0sUIW44ztMcWjb6bfzk0",
  authDomain: "agenda-tareas-9a30f.firebaseapp.com",
  projectId: "agenda-tareas-9a30f",
  storageBucket: "agenda-tareas-9a30f.firebasestorage.app",
  messagingSenderId: "425176114210",
  appId: "1:425176114210:web:fcfb0d6a2643bb49a6d67b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
