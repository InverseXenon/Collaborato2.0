import { useAuth } from "./AuthProvider";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Welcome {user?.email}</h1>
      <button
        onClick={logout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Log out
      </button>
    </div>
  );
}
