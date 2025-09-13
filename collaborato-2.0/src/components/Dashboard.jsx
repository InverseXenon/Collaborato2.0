import { useAuth } from "./AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Welcome, {user?.email || "Anonymous"} 👋
        </h1>

        <p className="text-gray-600 mb-6">
          This is your Collaborato 2.0 dashboard.
        </p>

        {/* Navigate to Docs page (to be built next) */}
        <Link
          to="/docs"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors mb-4"
        >
          Go to Documents
        </Link>

        <button
          onClick={() => signOut(auth)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
