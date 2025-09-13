import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { loginEmail, signUpEmail, loginGoogle, loginAnon } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");
      await loginEmail(email, password);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSignup = async () => {
    try {
      setError("");
      await signUpEmail(email, password);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow w-80">
        <h1 className="text-xl font-bold mb-4">Sign In</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          className="border w-full p-2 mb-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="border w-full p-2 mb-4 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-2">
          Login
        </button>
        <button onClick={handleSignup} className="bg-green-500 text-white px-4 py-2 rounded w-full mb-2">
          Sign Up
        </button>
        <button onClick={loginGoogle} className="bg-red-500 text-white px-4 py-2 rounded w-full mb-2">
          Google Sign In
        </button>
        <button onClick={loginAnon} className="bg-gray-400 text-white px-4 py-2 rounded w-full">
          Continue Anonymously
        </button>
      </div>
    </div>
  );
}
