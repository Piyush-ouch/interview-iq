import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { ServerUrl } from "../App";
import Navbar from "../components/Navbar";
import {
  FaTrophy,
  FaUsers,
  FaUserFriends,
  FaCopy,
  FaPlay,
  FaCheckCircle,
  FaClock,
  FaArrowLeft,
  FaShareAlt,
  FaRedo,
  FaSearch,
  FaShieldAlt,
  FaTimes,
  FaExternalLinkAlt,
  FaExchangeAlt,
} from "react-icons/fa";

function InterviewBattle() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userData } = useSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState("arena"); // 'arena', 'my-battles'
  const [role, setRole] = useState("Frontend Developer");
  const [experience, setExperience] = useState("Intermediate (1-3 yrs)");
  const [joinCodeInput, setJoinCodeInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [activeBattle, setActiveBattle] = useState(null);
  const [myBattles, setMyBattles] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);

  const roleSuggestions = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Engineer",
    "React Native Developer",
    "DevOps Engineer",
    "Data Scientist",
  ];

  const experienceOptions = [
    "Beginner (0-1 yrs)",
    "Intermediate (1-3 yrs)",
    "Senior (3-5+ yrs)",
  ];

  // Auto-fill code from URL query param ?code=BAT-XXXXX
  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setJoinCodeInput(codeFromUrl.toUpperCase());
    }
  }, [searchParams]);

  const fetchMyBattles = async () => {
    try {
      const res = await axios.get(`${ServerUrl}/api/battle/my-battles`, { withCredentials: true });
      if (res.data.success) {
        setMyBattles(res.data.battles || []);
      }
    } catch (err) {
      console.error("Failed to fetch my battles:", err);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchMyBattles();
    }
  }, [userData]);

  // Polling active battle status if waiting or matched
  useEffect(() => {
    let interval = null;
    if (activeBattle && (activeBattle.status === "waiting" || activeBattle.status === "matched")) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${ServerUrl}/api/battle/${activeBattle._id}`, { withCredentials: true });
          if (res.data.success) {
            setActiveBattle(res.data.battle);
          }
        } catch (err) {
          console.error("Error polling battle status:", err);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeBattle]);

  // Create Private or Public Battle
  const handleCreateBattle = async (isPrivateRoom = false) => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${ServerUrl}/api/battle/create`,
        { role, experience, isPrivate: isPrivateRoom },
        { withCredentials: true }
      );

      if (res.data.success) {
        setActiveBattle(res.data.battle);
        setSuccessMsg(
          isPrivateRoom
            ? `Private Room Created! Share code: ${res.data.battle.battleCode}`
            : "Entered Matchmaking Queue! Searching for an opponent..."
        );
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create battle room.");
    } finally {
      setLoading(false);
    }
  };

  // Join Battle by Code or Queue Matchmaking
  const handleJoinBattle = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setMatching(true);

    try {
      const res = await axios.post(
        `${ServerUrl}/api/battle/join`,
        {
          battleCode: joinCodeInput.trim() || undefined,
          role: !joinCodeInput ? role : undefined,
          experience: !joinCodeInput ? experience : undefined,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setActiveBattle(res.data.battle);
        setSuccessMsg("Match Found! Get ready for the 1v1 Battle.");
        fetchMyBattles();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to match with opponent.");
    } finally {
      setMatching(false);
    }
  };

  const copyInviteLink = () => {
    if (!activeBattle) return;
    const link = `${window.location.origin}/battle?code=${activeBattle.battleCode}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const startBattleInterview = () => {
    if (!activeBattle) return;
    // Launch interview session with shared questions
    navigate("/interview", {
      state: {
        role: activeBattle.role,
        experience: activeBattle.experience,
        mode: activeBattle.mode || "Technical",
        battleId: activeBattle._id,
        presetQuestions: activeBattle.questions,
      },
    });
  };

  const shareToLinkedIn = (battle) => {
    const text = encodeURIComponent(
      `🏆 Just completed a 1v1 AI Peer Interview Battle on InterviewIQ! Winner: ${
        battle.winnerId?.name || "Tied Match"
      }. Check out InterviewIQ.AI for mock interview prep!`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition shadow-xs cursor-pointer"
                title="Go Back"
              >
                <FaArrowLeft size={14} />
              </button>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <span className="text-red-600 font-extrabold text-2xl">⚔️</span>
                Peer vs Peer Interview Battle Arena
              </h1>
            </div>
            <p className="text-gray-500 text-sm mt-1 ml-11">
              Challenge peers or match 1v1. Both candidates answer the <strong>exact same 5 questions</strong> & AI declares the winner!
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-gray-200/70 p-1 rounded-xl w-fit self-start md:self-auto">
            <button
              onClick={() => setActiveTab("arena")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "arena"
                  ? "bg-white text-black shadow-xs"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <FaShieldAlt size={12} />
              Battle Lobby
            </button>
            <button
              onClick={() => {
                setActiveTab("my-battles");
                fetchMyBattles();
              }}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "my-battles"
                  ? "bg-white text-black shadow-xs"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <FaTrophy size={12} />
              My Past Battles ({myBattles.length})
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="text-red-500 hover:text-red-700">
              <FaTimes />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
            <FaCheckCircle className="text-emerald-600 size-5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: ARENA LOBBY & ACTIVE BATTLE */}
        {activeTab === "arena" && (
          <div className="space-y-8">
            {/* Active Battle Card (If currently waiting, matched, or reviewing) */}
            {activeBattle ? (
              <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-red-100 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-red-100 text-red-600 rounded-2xl font-black">1v1</span>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Battle Room: <span className="font-mono text-red-600">{activeBattle.battleCode}</span>
                      </h2>
                      <p className="text-xs text-gray-500">
                        Role: <strong>{activeBattle.role}</strong> &bull; Experience: <strong>{activeBattle.experience}</strong>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      activeBattle.status === "completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : activeBattle.status === "matched"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    Status: {activeBattle.status}
                  </span>
                </div>

                {/* Match Status Breakdown */}
                {activeBattle.status === "waiting" && (
                  <div className="text-center py-8 space-y-4">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 bg-red-400/20 rounded-full animate-ping"></div>
                      <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-full flex items-center justify-center font-extrabold text-2xl shadow-md">
                        VS
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Waiting for Opponent to Join...</h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                      Share your room code or invite link with a peer. The interview will launch with identical questions once matched!
                    </p>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={copyInviteLink}
                        className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer"
                      >
                        <FaCopy /> {copiedCode ? "Link Copied!" : "Copy Invite Link"}
                      </button>
                      <button
                        onClick={() => setActiveBattle(null)}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                      >
                        Leave Queue
                      </button>
                    </div>
                  </div>
                )}

                {activeBattle.status === "matched" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-gray-50 p-6 rounded-2xl border border-gray-200 text-center">
                      {/* Challenger */}
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">Challenger</p>
                        <p className="text-lg font-extrabold text-gray-900">
                          {activeBattle.challengerId?.name || "Player 1"}
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          activeBattle.challengerCompleted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {activeBattle.challengerCompleted ? "Interview Submitted" : "Pending Interview"}
                        </span>
                      </div>

                      {/* VS Icon */}
                      <div className="flex justify-center">
                        <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center font-black shadow-md text-lg">
                          VS
                        </div>
                      </div>

                      {/* Opponent */}
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">Opponent</p>
                        <p className="text-lg font-extrabold text-gray-900">
                          {activeBattle.opponentId?.name || "Player 2"}
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          activeBattle.opponentCompleted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {activeBattle.opponentCompleted ? "Interview Submitted" : "Pending Interview"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={startBattleInterview}
                      className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold py-4 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 text-base transition cursor-pointer"
                    >
                      <FaPlay /> Start 1v1 Battle Interview Now
                    </button>
                  </div>
                )}

                {/* COMPLETED BATTLE COMPARISON DASHBOARD */}
                {activeBattle.status === "completed" && (
                  <div className="space-y-8">
                    {/* Winner Banner */}
                    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white p-6 rounded-2xl shadow-md text-center space-y-2">
                      <FaTrophy size={40} className="mx-auto text-yellow-200" />
                      <h3 className="text-2xl font-black">
                        Winner: {activeBattle.winnerId?.name || "Match Completed!"} 🎉
                      </h3>
                      {activeBattle.verdict && (
                        <p className="text-xs text-yellow-100 max-w-xl mx-auto leading-relaxed bg-black/20 p-3 rounded-xl">
                          "{activeBattle.verdict}"
                        </p>
                      )}
                    </div>

                    {/* Side-by-Side Comparison Scorecard */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Player 1 Card */}
                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900">{activeBattle.challengerId?.name}</h4>
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-bold">Challenger</span>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900">
                          {activeBattle.challengerInterviewId?.finalScore?.toFixed(1) || 0} <span className="text-xs text-gray-400 font-normal">/ 10</span>
                        </p>
                      </div>

                      {/* Player 2 Card */}
                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900">{activeBattle.opponentId?.name}</h4>
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-bold">Opponent</span>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900">
                          {activeBattle.opponentInterviewId?.finalScore?.toFixed(1) || 0} <span className="text-xs text-gray-400 font-normal">/ 10</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => shareToLinkedIn(activeBattle)}
                        className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer"
                      >
                        <FaExternalLinkAlt /> Share Victory on LinkedIn
                      </button>
                      <button
                        onClick={() => setActiveBattle(null)}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        New Battle
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Create or Join Options */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Option 1: Quick Matchmaking */}
                <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FaUsers className="text-red-600" /> Matchmaking Queue & Setup
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Target Job Role</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {roleSuggestions.map((r) => (
                          <button
                            type="button"
                            key={r}
                            onClick={() => setRole(r)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                              role === r
                                ? "bg-black text-white border-black"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Experience Level</label>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-black"
                      >
                        {experienceOptions.map((exp) => (
                          <option key={exp} value={exp}>
                            {exp}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <button
                        onClick={() => handleJoinBattle()}
                        disabled={matching}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-6 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
                      >
                        <FaSearch /> {matching ? "Searching Opponent..." : "Find Quick 1v1 Match"}
                      </button>

                      <button
                        onClick={() => handleCreateBattle(true)}
                        disabled={loading}
                        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
                      >
                        <FaUserFriends /> Create Private Room
                      </button>
                    </div>
                  </div>
                </div>

                {/* Option 2: Join via Room Code */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                      <FaCopy className="text-blue-600" /> Join via Battle Code
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Have a friend's room code? Enter it below to join their 1v1 interview session.
                    </p>

                    <form onSubmit={handleJoinBattle} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Enter Room Code (e.g. BAT-A8F2K)"
                        value={joinCodeInput}
                        onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-mono font-bold focus:ring-2 focus:ring-black uppercase"
                      />
                      <button
                        type="submit"
                        disabled={matching || !joinCodeInput.trim()}
                        className="w-full bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer"
                      >
                        Join Battle Room
                      </button>
                    </form>
                  </div>

                  <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-xs text-red-900 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <FaShieldAlt /> Battle Rules:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      <li>Both candidates answer the <strong>same 5 questions</strong>.</li>
                      <li>Scored on technical accuracy, clarity & speed.</li>
                      <li>AI generates a battle verdict upon completion.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY BATTLES HISTORY */}
        {activeTab === "my-battles" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FaTrophy className="text-amber-500" /> Your Battle History
            </h2>

            {myBattles.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
                No past battles found. Create or join a 1v1 interview battle above!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myBattles.map((b) => {
                  const isWinner = b.winnerId?._id === userData?._id;
                  return (
                    <div
                      key={b._id}
                      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                          {b.battleCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                            b.status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{b.role}</h3>
                        <p className="text-xs text-gray-500">
                          Challenger: {b.challengerId?.name} vs Opponent: {b.opponentId?.name || "Waiting"}
                        </p>
                      </div>

                      {b.status === "completed" && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs flex items-center justify-between">
                          <span>
                            Winner: <strong>{b.winnerId?.name}</strong>
                          </span>
                          {isWinner && (
                            <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2 py-0.5 rounded-md">
                              🏆 Victory
                            </span>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setActiveBattle(b);
                          setActiveTab("arena");
                        }}
                        className="w-full bg-black hover:bg-gray-800 text-white text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer"
                      >
                        View Battle Details
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default InterviewBattle;
