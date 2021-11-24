// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDa86qst2pcYi3kXxWDDxSx-8TfJFKE2N8",
  authDomain: "tinder-clone-cad4c.firebaseapp.com",
  projectId: "tinder-clone-cad4c",
  storageBucket: "tinder-clone-cad4c.appspot.com",
  messagingSenderId: "979951250205",
  appId: "1:979951250205:web:1879ba203ea47309e18ff4",
  measurementId: "G-37MQQNRFMR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

export { auth, db };
