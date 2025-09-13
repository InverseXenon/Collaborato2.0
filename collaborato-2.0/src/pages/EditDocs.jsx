// src/pages/EditDocs.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { database } from "../firebaseConfig";

export default function EditDocs() {
  const { docId } = useParams();
  const [docData, setDocData] = useState(null);

  useEffect(() => {
    if (!docId) return;
    const dref = doc(database, "documents", docId);
    const unsub = onSnapshot(dref, (snap) => {
      if (!snap.exists()) {
        setDocData(null);
        return;
      }
      setDocData({ id: snap.id, ...snap.data() });
    }, (err) => {
      console.error("Error fetching doc:", err);
    });

    return () => unsub();
  }, [docId]);

  if (!docData) return <div className="p-6">Loading document...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{docData.title}</h1>
      <div className="border p-6 bg-white" dangerouslySetInnerHTML={{ __html: docData.content }} />
      <div className="mt-4 text-sm text-gray-500">Owner: {docData.owner}</div>
      {/* Later: Quill editor, sockets, comments, preview toggle */}
    </div>
  );
}
