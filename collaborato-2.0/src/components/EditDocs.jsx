import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
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
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const quillRef = useRef(null);
  const saveTimer = useRef(null);

  // Firestore: initial load & real-time content
  useEffect(() => {
    const ref = doc(db, "documents", id);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title || "Untitled");
        if (quillRef.current && !quillRef.current.getEditor().hasFocus()) {
          quillRef.current.getEditor().setContents(data.content || []);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  // Socket.io presence + deltas
  useEffect(() => {
    if (!user) return;
    socket.emit("join-doc", id, { uid: user.uid, email: user.email });

    socket.on("receive-delta", (delta) => {
      quillRef.current?.getEditor().updateContents(delta);
    });

    socket.on("user-typing", (who) => {
      setTypingUser(who.email);
      setTimeout(() => setTypingUser(null), 1500);
    });

    socket.on("presence", (list) => {
      const unique = Array.from(
        new Map(list.map((u) => [u.uid, u])).values()
      );
      setOnlineUsers(unique);
    });

    return () => {
      socket.emit("leave-doc", id, { uid: user.uid });
      socket.off("receive-delta");
      socket.off("user-typing");
      socket.off("presence");
    };
  }, [id, user]);

  // Save to Firestore every 2s
  const queueSave = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await updateDoc(doc(db, "documents", id), {
        content: quillRef.current?.getEditor().getContents(),
        updatedAt: serverTimestamp(),
      });
    }, 2000);
  };

  const handleChange = (content, delta, source) => {
    if (source === "user") {
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-lg text-gray-600 animate-pulse">Loading…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Main Container */}
      <div className="max-w-5xl mx-auto flex gap-6">
        {/* Editor Section */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <input
              className="text-2xl font-semibold text-gray-800 w-full border-none focus:ring-2 focus:ring-purple-300 rounded-md p-2 bg-transparent"
              value={title}
              onChange={(e) => saveTitle(e.target.value)}
              placeholder="Document Title"
            />
            <button
              onClick={exportPDF}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
            >
              Export as PDF
            </button>
          </div>

          {typingUser && (
            <p className="text-sm text-gray-500 italic mb-2">
              {typingUser} is typing…
            </p>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              onChange={handleChange}
              className="min-h-[400px] max-h-[600px] overflow-y-auto"
            />
          </div>
        </div>

        {/* Presence Sidebar
        <aside className="hidden lg:block w-64 bg-white shadow-md rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Online Users</h4>
          {onlineUsers.length === 0 ? (
            <p className="text-sm text-gray-400">No one else here</p>
          ) : (
            <ul className="space-y-2">
              {onlineUsers.map((u) => (
                <li
                  key={u.uid}
                  className="text-sm text-gray-600 truncate"
                  title={u.email}
                >
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  {u.email || "Anonymous"}
                </li>
              ))}
            </ul>
          )}
        </aside> */}
      </div>
    </div>
  );
}