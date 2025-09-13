import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, serverTimestamp, query, where } from "firebase/firestore";
import { database as db } from "../firebaseConfig";
import { useAuth } from "./AuthProvider";
import { Link } from "react-router-dom";

export default function Docs() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  // Listen for docs owned by or shared with current user
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "documents"),
      where(`roles.${user.uid}`, "in", ["owner", "editor", "viewer"])
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setDocs(list);
    });
    return () => unsub();
  }, [user]);

  const createDoc = async () => {
    if (!title.trim()) return setError("Title required");
    setError("");

    try {
      await addDoc(collection(db, "documents"), {
        title,
        content: "", // blank for now; will hold Quill delta
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Your Documents</h1>

        {/* Create new document */}
        <div className="flex mb-6">
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

        {/* List docs */}
        <div className="space-y-3">
          {docs.map((d) => (
            <Link
              key={d.id}
              to={`/edit/${d.id}`}
              className="block bg-white p-4 rounded shadow hover:bg-blue-50"
            >
              <p className="font-semibold">{d.title || "Untitled"}</p>
              <p className="text-sm text-gray-500">
                Owner: {d.owner === user.uid ? "You" : "Shared"}
              </p>
            </Link>
          ))}
          {docs.length === 0 && (
            <p className="text-gray-600">No documents yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
