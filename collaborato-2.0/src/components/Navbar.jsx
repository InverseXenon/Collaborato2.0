import { AuthProvider } from "./components/AuthProvider";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="font-bold text-lg">Collaborato 2.0</h1>
      {user && (
        <div className="flex items-center space-x-4">
          <span>{user.email || "Anonymous"}</span>
          <button
            onClick={logout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
