// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdG8hmPdobuUzeYafGgraX4KPV-o670Sc",
  authDomain: "rateeverything-8a8f0.firebaseapp.com",
  databaseURL: "https://rateeverything-8a8f0-default-rtdb.firebaseio.com",
  projectId: "rateeverything-8a8f0",
  storageBucket: "rateeverything-8a8f0.firebasestorage.app",
  messagingSenderId: "539676971597",
  appId: "1:539676971597:web:f8bbc19b4494c94b1c8204",
  measurementId: "G-VZBXS3WBY9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);