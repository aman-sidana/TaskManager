// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBdy7TepFl60VgaJ7ovFK1JkXZ_VnaU2nQ",
  authDomain: "taskmanager-bcfa9.firebaseapp.com",
  projectId: "taskmanager-bcfa9",
  storageBucket: "taskmanager-bcfa9.firebasestorage.app",
  messagingSenderId: "270051503872",
  appId: "1:270051503872:web:3d8fa09867e59aaa4b8de5",
  measurementId: "G-1N7431HQ7C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
