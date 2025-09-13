import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  enableMultiTabIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyADoKPcm038rqhPMLYwkC6JRr2b8-YT3ek",
  authDomain: "research-paper-6b36a.firebaseapp.com",
  projectId: "research-paper-6b36a",
  storageBucket: "research-paper-6b36a.firebasestorage.app",
  messagingSenderId: "161155176990",
  appId: "1:161155176990:web:51f1321a54a4561153ec0f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

enableMultiTabIndexedDbPersistence(db, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
}).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.log('The current browser does not support all of the features required to enable persistence.');
  }
});

export { db as database };
export const auth = getAuth(app);
