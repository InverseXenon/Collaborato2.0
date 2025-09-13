// src/pages/Docs.jsx
import React, { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, where, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { database } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import templates from "../templates/templates.json";

export default function Docs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [titleInput, setTitleInput] = useState("");

  useEffect(() => {
    if (!user) return;
    // We store user access in `sharedWith` (array) so querying is simple
    const docsRef = collection(database, "documents");
    const q = query(docsRef, where("sharedWith", "array-contains", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach(docSnap => {
        arr.push({ id: docSnap.id, ...docSnap.data() });
      });
      // sort by lastUpdated
      arr.sort((a, b) => (b.lastUpdated?.seconds || 0) - (a.lastUpdated?.seconds || 0));
      setDocs(arr);
      setLoading(false);
    }, (err) => {
      console.error("Docs subscription error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  async function handleCreateDocument(e) {
    e.preventDefault();
    if (!user) return;
    const tpl = templates[selectedTemplate] || templates.blank;
    const newTitle = titleInput.trim() || tpl.name + " - Untitled";
    try {
      const docRef = await addDoc(collection(database, "documents"), {
        title: newTitle,
        content: tpl.content,         // initial HTML content; later we may store Quill delta too
        owner: user.uid,
        roles: { [user.uid]: "owner" }, // mapping; easier to check ownership later
        sharedWith: [user.uid],        // array used for querying membership
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      // navigate to edit page
      navigate(`/edit/${docRef.id}`);
    } catch (err) {
      console.error("Error creating doc:", err);
      alert("Failed to create document: " + err.message);
    }
  }

  const filtered = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Documents</h2>
        <div className="flex items-center gap-3">
          <input
            placeholder="Search by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border p-2 rounded"
          />
          <button onClick={() => setShowCreate(true)} className="bg-indigo-600 text-white px-4 py-2 rounded">
            + New Document
          </button>
        </div>
      </div>

      {loading ? <div>Loading documents...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(d => (
            <div key={d.id} className="border rounded p-4 hover:shadow cursor-pointer" onClick={() => navigate(`/edit/${d.id}`)}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{d.title}</h3>
                  <p className="text-sm text-gray-500">Owner: {d.owner === user.uid ? "You" : d.owner}</p>
                </div>
                <div className="text-xs text-gray-400">{d.lastUpdated?.toDate ? d.lastUpdated.toDate().toLocaleString() : ""}</div>
              </div>
              <div className="mt-3 text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: (d.content || "").slice(0, 200) + (d.content && d.content.length > 200 ? "..." : "") }} />
            </div>
          ))}
          {filtered.length === 0 && <div className="text-gray-500">No matching documents.</div>}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New Document</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-500">Close</button>
            </div>

            <form onSubmit={handleCreateDocument}>
              <input className="border p-2 w-full mb-3 rounded" placeholder="Document title (optional)" value={titleInput} onChange={e => setTitleInput(e.target.value)} />

              <div className="mb-4">
                <p className="font-medium mb-2">Choose a template</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.values(templates).map(t => (
                    <div key={t.key} className={`p-3 border rounded cursor-pointer ${selectedTemplate === t.key ? "ring-2 ring-indigo-400" : ""}`} onClick={() => setSelectedTemplate(t.key)}>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-xs text-gray-500 mt-2" dangerouslySetInnerHTML={{ __html: (t.content || "").slice(0, 120) + (t.content && t.content.length > 120 ? "..." : "") }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
