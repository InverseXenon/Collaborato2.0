import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <form onSubmit={handleSignup} className="w-full max-w-sm bg-white rounded-xl p-6 shadow space-y-4">
        <h2 className="text-xl font-bold text-center text-gray-800">Sign Up</h2>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="border p-2"/>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="border p-2"/>
      <button className="bg-blue-500 text-white p-2">Sign Up</button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
    </div>
  );
}
