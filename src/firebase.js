import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDxxP8OgZD6u56OFQVxBIEsDCMCa9KJIWQ",
  authDomain: "money-manager-1f7fd.firebaseapp.com",
  projectId: "money-manager-1f7fd",
  storageBucket: "money-manager-1f7fd.appspot.com",
  messagingSenderId: "948591842120",
  appId: "1:948591842120:web:292bfa63002dda024b997d",
  measurementId: "G-8491HY630S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


export { db, addDoc, collection, getDocs, deleteDoc, doc };
