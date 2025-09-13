import { createContext, useContext, useEffect, useState } from "react";
import { 
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously
} from "firebase/auth";
import { auth } from "../firebaseConfig";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // keep user in sync with Firebase
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Auth methods
  const signUpEmail = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);
  const loginEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);
  const loginGoogle = () =>
    signInWithPopup(auth, new GoogleAuthProvider());
  const loginAnon = () =>
    signInAnonymously(auth);
  const logout = () => signOut(auth);

  const value = { user, signUpEmail, loginEmail, loginGoogle, loginAnon, logout };
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
