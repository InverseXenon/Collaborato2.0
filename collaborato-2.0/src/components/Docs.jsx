import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { database as db } from "../firebaseConfig";
import { useAuth } from "./AuthProvider";
import { Link } from "react-router-dom";

export default function Docs() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch documents
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "documents"),
      where(`roles.${user.uid}`, "in", ["owner", "editor", "viewer"])
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setDocs(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const createDoc = async () => {
    if (!title.trim()) return setError("Title required");
    setError("");
    try {
      await addDoc(collection(db, "documents"), {
        title,
        content: "",
        owner: user.uid,
        roles: { [user.uid]: "owner" },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setTitle("");
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredDocs = docs.filter((d) =>
    d.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800" >Your Documents</h1>
        <button
            onClick={() => navigate("/dashboard")}
            className="px-3 py-1 bg-gray-200 mb-4 rounded hover:bg-gray-300 text-sm font-medium"
          >
            🏠 Home
          </button>

          
        {/* Create new document */}
        <div className="flex mb-4">
          <input
            className="flex-1 border p-2 rounded-l"
            placeholder="New document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            onClick={createDoc}
            className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700"
          >
            Create
          </button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search documents…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 w-full rounded mb-6"
        />

        {/* Docs list with shimmer */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        ) : filteredDocs.length ? (
          <div className="space-y-3">
            {filteredDocs.map((d) => (
              <Link
                key={d.id}
                to={`/edit/${d.id}`}
                className="block bg-white p-4 rounded shadow hover:bg-blue-50 transition"
              >
                <p className="font-semibold text-gray-800">
                  {d.title || "Untitled"}
                </p>
                <p className="text-sm text-gray-500">
                  Owner: {d.owner === user.uid ? "You" : "Shared"}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No documents found.</p>
        )}
      </div>
    </div>
  );
}
