import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { database as db } from "../firebaseConfig";
import { useAuth } from "./AuthProvider";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { socket } from "../utils/socket";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function EditDocs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const quillRef = useRef(null);
  const saveTimer = useRef(null);

  /* ------------------- Firestore initial load ------------------- */
  useEffect(() => {
    const ref = doc(db, "documents", id);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title || "Untitled");
        // Update editor only if not focused
        if (quillRef.current && !quillRef.current.getEditor().hasFocus()) {
          quillRef.current.getEditor().setContents(data.content || []);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  /* ------------------- Socket presence + deltas ------------------- */
  useEffect(() => {
    if (!user) return;

    // join room
    socket.emit("join-doc", { docId: id, user: { uid: user.uid, email: user.email } });

    socket.on("receive-delta", ({ delta }) => {
      quillRef.current?.getEditor().updateContents(delta);
    });

    socket.on("user-typing", (who) => {
      setTypingUser(who.email);
      setTimeout(() => setTypingUser(null), 1500);
    });

    socket.on("presence", (list) => {
      const unique = Array.from(new Map(list.map((u) => [u.uid, u])).values());
      setOnlineUsers(unique);
    });

    return () => {
      socket.emit("leave-doc", { docId: id, uid: user.uid });
      socket.off("receive-delta");
      socket.off("user-typing");
      socket.off("presence");
    };
  }, [id, user]);

  /* ------------------- Save to Firestore ------------------- */
  const queueSave = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await updateDoc(doc(db, "documents", id), {
        content: quillRef.current?.getEditor().getContents(),
        updatedAt: serverTimestamp(),
      });
    }, 1500);
  };

  const handleChange = (content, delta, source) => {
    if (source === "user") {
      // FIX: send docId & delta as object for server
      socket.emit("send-delta", { docId: id, delta });
      socket.emit("typing", { docId: id, user: { email: user.email } });
      queueSave();
    }
  };

  const saveTitle = async (newTitle) => {
    setTitle(newTitle);
    await updateDoc(doc(db, "documents", id), {
      title: newTitle,
      updatedAt: serverTimestamp(),
    });
  };

  /* ------------------- Export as PDF ------------------- */
  const exportPDF = async () => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const html = editor.root;
    const canvas = await html2canvas(html, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save(`${title || "document"}.pdf`);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600 animate-pulse">Loading…</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        {/* Top bar with Back + Export */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate("/docs")}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm font-medium"
          >
            ← Back
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm font-medium"
          >
            🏠 Home
          </button>

          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
          >
            Export PDF
          </button>
        </div>

        {/* Title */}
        <input
          className="text-2xl font-semibold text-gray-800 w-full border-none focus:ring-2 focus:ring-purple-300 rounded-md p-2 bg-transparent"
          value={title}
          onChange={(e) => saveTitle(e.target.value)}
          placeholder="Document Title"
        />

        {typingUser && (
          <p className="text-sm text-gray-500 italic mb-2">
            {typingUser} is typing…
          </p>
        )}

        {/* Editor */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            onChange={handleChange}
            className="min-h-[400px] max-h-[600px] overflow-y-auto"
          />
        </div>
      </div>
    </div>
  );
}
