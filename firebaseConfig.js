import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD20f6Visx6kDcKvJ0EcP7tAlzeC38a5KM",
  authDomain: "uniflix-1.firebaseapp.com",
  projectId: "uniflix-1",
  storageBucket: "uniflix-1.firebasestorage.app",
  messagingSenderId: "445115784294",
  appId: "1:445115784294:web:25897fe5372c3a18b621a7",
  measurementId: "G-CJXKECNPNL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

