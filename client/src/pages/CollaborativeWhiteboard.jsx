import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhiteboardCanvas from "../components/WhiteboardCanvas";
import CollaborativeCodeEditor from "../components/CollaborativeCodeEditor";
import { useSelector } from "react-redux";
import axios from "axios";
import { ServerUrl } from "../App";
import { motion } from "motion/react";
import {
  FaChalkboard,
  FaCode,
  FaColumns,
  FaShareAlt,
  FaUsers,
  FaSave,
  FaCheck,
  FaBolt,
  FaExpand,
  FaCopy,
} from "react-icons/fa";

function CollaborativeWhiteboard() {
  const { roomId: paramRoomId } = useParams();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [roomId, setRoomId] = useState(paramRoomId || `room_${Math.random().toString(36).substring(2, 9)}`);
  const [roomTitle, setRoomTitle] = useState("System Design & Technical Interview Room");
  const [viewMode, setViewMode] = useState("split"); // 'split', 'whiteboard', 'code'
  
  const [strokes, setStrokes] = useState([]);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [laserPoint, setLaserPoint] = useState(null);
  
  const [clientsCount, setClientsCount] = useState(1);
  const [activeEditorSender, setActiveEditorSender] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const wsRef = useRef(null);

  // Initialize room data & WebSocket
  useEffect(() => {
    fetchRoomState();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomId]);

  const fetchRoomState = async () => {
    try {
      const res = await axios.get(`${ServerUrl}/api/whiteboard/room/${roomId}`, {
        withCredentials: true,
      });
      if (res.data.success && res.data.room) {
        setRoomTitle(res.data.room.title || "Technical Interview Collaborative Session");
        if (res.data.room.code) setCode(res.data.room.code);
        if (res.data.room.language) setLanguage(res.data.room.language);
        if (res.data.room.canvasStrokes) setStrokes(res.data.room.canvasStrokes);
      }
    } catch (error) {
      console.error("Error fetching whiteboard room state:", error);
    }
  };

  const connectWebSocket = () => {
    const wsUrl = ServerUrl.replace(/^http/, "ws") + "/ws/metrics";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join_whiteboard_room",
          payload: {
            roomId,
            userName: userData?.name || "Candidate",
          },
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { type, payload } = message;

        switch (type) {
          case "whiteboard_joined":
            setClientsCount(payload.clientsCount || 1);
            if (payload.strokes && payload.strokes.length > 0) setStrokes(payload.strokes);
            if (payload.code) setCode(payload.code);
            break;

          case "user_joined_whiteboard":
            setClientsCount(payload.clientsCount || 1);
            break;

          case "whiteboard_stroke_added":
            if (payload.stroke) {
              setStrokes((prev) => [...prev, payload.stroke]);
            }
            break;

          case "whiteboard_cleared":
            setStrokes([]);
            break;

          case "code_updated":
            if (payload.code !== undefined) setCode(payload.code);
            if (payload.language) setLanguage(payload.language);
            if (payload.senderName) {
              setActiveEditorSender(payload.senderName);
              setTimeout(() => setActiveEditorSender(""), 2000);
            }
            break;

          case "laser_moved":
            if (payload.point) {
              setLaserPoint(payload.point);
              setTimeout(() => setLaserPoint(null), 1200);
            }
            break;

          default:
            break;
        }
      } catch (err) {
        console.error("WebSocket payload error:", err);
      }
    };
  };

  const handleDrawStroke = (stroke) => {
    setStrokes((prev) => [...prev, stroke]);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "whiteboard_draw_stroke",
          payload: { roomId, stroke },
        })
      );
    }
  };

  const handleClearStrokes = () => {
    setStrokes([]);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "whiteboard_clear",
          payload: { roomId },
        })
      );
    }
  };

  const handleCodeChange = (newCode, newLang) => {
    setCode(newCode);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "code_update",
          payload: {
            roomId,
            code: newCode,
            language: newLang || language,
            senderName: userData?.name || "Peer",
          },
        })
      );
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    handleCodeChange(code, newLang);
  };

  const handleLaserMove = (point) => {
    setLaserPoint(point);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "laser_annotation",
          payload: {
            roomId,
            point,
            senderName: userData?.name || "Peer",
          },
        })
      );
    }
  };

  const handleSaveRoom = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${ServerUrl}/api/whiteboard/room/${roomId}`,
        {
          code,
          language,
          canvasStrokes: strokes,
          title: roomTitle,
        },
        { withCredentials: true }
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Error saving room:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/whiteboard/${roomId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col">
      <Navbar />

      {/* Control Header Bar */}
      <div className="px-4 py-4 max-w-7xl mx-auto w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <FaBolt size={10} />
                LIVE WEBSOCKET SESSION
              </span>
              <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <FaUsers className="text-emerald-400" size={12} />
                {clientsCount} Active Participant{clientsCount > 1 ? "s" : ""}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
              <FaChalkboard className="text-emerald-500" />
              <span>{roomTitle}</span>
            </h1>
          </div>

          {/* View Mode Switcher & Room Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Selector */}
            <div className="bg-slate-800 p-1 rounded-2xl border border-slate-700 flex items-center gap-1">
              <button
                onClick={() => setViewMode("split")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "split" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <FaColumns size={12} />
                <span>Dual View</span>
              </button>
              <button
                onClick={() => setViewMode("whiteboard")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "whiteboard" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <FaChalkboard size={12} />
                <span>Whiteboard</span>
              </button>
              <button
                onClick={() => setViewMode("code")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "code" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <FaCode size={12} />
                <span>Code Studio</span>
              </button>
            </div>

            {/* Save & Invite Actions */}
            <button
              onClick={handleSaveRoom}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              {saveSuccess ? <FaCheck className="text-emerald-400" /> : <FaSave />}
              <span>{saveSuccess ? "Saved!" : "Save State"}</span>
            </button>

            <button
              onClick={handleCopyInviteLink}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <FaCheck /> : <FaShareAlt />}
              <span>{copiedLink ? "Link Copied!" : "Invite Peer"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <main className="flex-1 px-4 max-w-7xl mx-auto w-full pb-10 flex flex-col">
        {viewMode === "split" && (
          <div className="grid lg:grid-cols-2 gap-6 h-[720px] flex-1">
            <WhiteboardCanvas
              strokes={strokes}
              onDrawStroke={handleDrawStroke}
              onClear={handleClearStrokes}
              laserPoint={laserPoint}
              onLaserMove={handleLaserMove}
            />
            <CollaborativeCodeEditor
              code={code}
              language={language}
              onCodeChange={handleCodeChange}
              onLanguageChange={handleLanguageChange}
              senderName={activeEditorSender}
            />
          </div>
        )}

        {viewMode === "whiteboard" && (
          <div className="h-[760px] flex-1">
            <WhiteboardCanvas
              strokes={strokes}
              onDrawStroke={handleDrawStroke}
              onClear={handleClearStrokes}
              laserPoint={laserPoint}
              onLaserMove={handleLaserMove}
            />
          </div>
        )}

        {viewMode === "code" && (
          <div className="h-[760px] flex-1">
            <CollaborativeCodeEditor
              code={code}
              language={language}
              onCodeChange={handleCodeChange}
              onLanguageChange={handleLanguageChange}
              senderName={activeEditorSender}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default CollaborativeWhiteboard;
