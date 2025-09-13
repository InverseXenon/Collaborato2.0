import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  enableMultiTabIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAqe3qeXP77wkcYoRaTf9-Dwir8ooTORnI",
  authDomain: "collaboratov2.firebaseapp.com",
  projectId: "collaboratov2",
  storageBucket: "collaboratov2.appspot.com",   
  messagingSenderId: "1067743158668",
  appId: "1:1067743158668:web:a572147bf1f6acc387b6a9"
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
