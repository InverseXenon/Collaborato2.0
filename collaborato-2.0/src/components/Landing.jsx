import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome to Collaborato 2.0</h1>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="rounded-md bg-blue-600 text-white px-5 py-2 font-medium hover:bg-blue-700 transition"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="rounded-md bg-green-600 text-white px-5 py-2 font-medium hover:bg-green-700 transition"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
