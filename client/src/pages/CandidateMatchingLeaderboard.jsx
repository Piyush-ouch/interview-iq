import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { ServerUrl } from "../App";
import { useSelector } from "react-redux";
import {
  FaUsers,
  FaTrophy,
  FaBullseye,
  FaCrown,
  FaMedal,
  FaSearch,
  FaChartLine,
  FaSlidersH,
  FaHandshake,
  FaCheckCircle,
  FaTimes,
  FaBolt,
  FaRocket,
  FaShieldAlt,
  FaLayerGroup,
  FaArrowUp,
} from "react-icons/fa";

function CandidateMatchingLeaderboard() {
  const { userData } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("matches"); // 'matches', 'groups', 'leaderboard'
  
  // Data states
  const [userProfile, setUserProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Modals
  const [roleFilter, setRoleFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [selectedCandidate, setSelectedCandidate] = useState(null); // For Compare Modal
  const [inviteCandidate, setInviteCandidate] = useState(null); // For Invite Modal
  const [inviteTopic, setInviteTopic] = useState("System Design & Technical Deep-Dive");
  const [inviteNote, setInviteNote] = useState("Hi! Let's schedule a mock interview partnership to practice together.");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matchRes, groupRes, lbRes] = await Promise.all([
        axios.get(`${ServerUrl}/api/matching/candidates`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/matching/groups`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/matching/leaderboard`, { withCredentials: true }),
      ]);

      if (matchRes.data.success) {
        setUserProfile(matchRes.data.userProfile);
        setMatches(matchRes.data.matches);
      }
      if (groupRes.data.success) {
        setGroups(groupRes.data.groups);
      }
      if (lbRes.data.success) {
        setLeaderboard(lbRes.data.leaderboard);
      }
    } catch (error) {
      console.error("Error fetching matching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteCandidate) return;
    try {
      const response = await axios.post(
        `${ServerUrl}/api/matching/request`,
        {
          receiverId: inviteCandidate._id,
          topic: inviteTopic,
          difficultyTier: inviteCandidate.difficultyTier,
          note: inviteNote,
        },
        { withCredentials: true }
      );
      if (response.data.success) {
        setInviteSuccess(true);
        setTimeout(() => {
          setInviteSuccess(false);
          setInviteCandidate(null);
        }, 1800);
      }
    } catch (error) {
      console.error("Error sending partnership invite:", error);
    }
  };

  // Filtered matches
  const filteredMatches = matches.filter((item) => {
    const roleMatch = roleFilter === "All" || item.targetRole.toLowerCase().includes(roleFilter.toLowerCase());
    const diffMatch = difficultyFilter === "All" || item.difficultyTier === difficultyFilter;
    return roleMatch && diffMatch;
  });

  // Filtered leaderboard
  const filteredLeaderboard = leaderboard.filter((item) => {
    return roleFilter === "All" || item.targetRole.toLowerCase().includes(roleFilter.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0b0f19] text-gray-900 dark:text-white transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 py-10 max-w-7xl mx-auto w-full">
        {/* Header Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 mb-8 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-3 border border-emerald-500/20">
                <FaBolt size={12} />
                <span>AI MATCHING ENGINE & LEADERBOARD</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Peer Interviewer <span className="text-emerald-600 dark:text-emerald-400">Match & Leaderboard</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl text-sm md:text-base">
                Smart candidate matching based on complementary skill gaps, peer difficulty tiers, and global percentile ranking.
              </p>
            </div>

            {/* Quick Stats Pill */}
            {userProfile && (
              <div className="bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/60 rounded-2xl p-4 flex items-center gap-6 min-w-[260px]">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Your Performance</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{userProfile.overallRating} <span className="text-xs text-gray-400">/100</span></p>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:bg-slate-700" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Current Tier</p>
                  <span className="inline-block bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 text-xs font-bold px-2.5 py-1 rounded-md mt-0.5">
                    {userProfile.difficultyTier}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-3 mt-8 border-t border-gray-100 dark:border-slate-800 pt-6">
            <button
              onClick={() => setActiveTab("matches")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                activeTab === "matches"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              <FaBullseye size={16} />
              <span>Smart Candidate Matches</span>
              <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{matches.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("groups")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                activeTab === "groups"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              <FaUsers size={16} />
              <span>Difficulty Partnership Pools</span>
              <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{groups.length} Pools</span>
            </button>

            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                activeTab === "leaderboard"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              <FaTrophy size={16} />
              <span>Peer Candidate Leaderboard</span>
            </button>
          </div>
        </motion.div>

        {/* Global Controls & Search Bar */}
        {(activeTab === "matches" || activeTab === "leaderboard") && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                <FaSlidersH size={14} />
                <span>Filter Role:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["All", "Full Stack", "Backend", "Frontend", "AI / ML", "Product Manager"].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      roleFilter === role
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "matches" && (
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tier:</span>
                {["All", "Beginner", "Intermediate", "Advanced", "Elite"].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setDifficultyFilter(tier)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      difficultyFilter === tier
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Smart Candidate Matches */}
        {activeTab === "matches" && (
          <div>
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-64 bg-gray-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((candidate, idx) => (
                  <motion.div
                    key={candidate._id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all relative flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Match Bar */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                          <FaBolt size={10} className="text-emerald-500" />
                          {candidate.matchPercentage}% Match Score
                        </span>

                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                          {candidate.difficultyTier}
                        </span>
                      </div>

                      {/* Candidate Avatar & Info */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white text-xl font-bold flex items-center justify-center shadow-md">
                          {candidate.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                            {candidate.name}
                          </h3>
                          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {candidate.targetRole}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {candidate.experienceLevel}
                          </p>
                        </div>
                      </div>

                      {/* Match Reason Banner */}
                      <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 mb-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                        <FaHandshake size={14} className="text-emerald-500 shrink-0" />
                        <span className="truncate">{candidate.matchReason}</span>
                      </div>

                      {/* Strengths & Skill Gaps */}
                      <div className="space-y-3 mb-5 text-xs">
                        <div>
                          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Key Strengths
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.strengths.map((str, i) => (
                              <span
                                key={i}
                                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-md font-medium border border-emerald-200 dark:border-emerald-900"
                              >
                                {str}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Target Practice Gaps
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.skillGaps.map((gap, i) => (
                              <span
                                key={i}
                                className="bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 rounded-md font-medium border border-amber-200 dark:border-amber-900"
                              >
                                {gap}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <div className="text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Rating: </span>
                        <span className="font-extrabold text-gray-900 dark:text-white">{candidate.overallRating}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCandidate(candidate)}
                          className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer"
                        >
                          Compare
                        </button>

                        <button
                          onClick={() => setInviteCandidate(candidate)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                          <FaHandshake size={12} />
                          <span>Invite</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Difficulty Partnership Pools */}
        {activeTab === "groups" && (
          <div className="grid md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm relative overflow-hidden flex flex-col justify-between"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${group.color} opacity-10 rounded-full blur-2xl pointer-events-none`} />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full text-white bg-gradient-to-r ${group.color}`}>
                      {group.badge}
                    </span>

                    {group.isCurrent && (
                      <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-300 dark:border-emerald-800">
                        YOUR CURRENT TIER
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{group.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                    {group.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-800/60 rounded-2xl p-4 mb-6 border border-gray-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Target Role Focus:</span>
                      <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{group.targetRole}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Active Candidates:</span>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{group.membersCount} Candidates ({group.activeSessions} Online)</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Difficulty: <strong className="text-gray-900 dark:text-white">{group.tier}</strong>
                  </span>

                  <button
                    onClick={() => alert(`Joined ${group.title}! You will be prioritized for ${group.tier} level peer mocks.`)}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-sm cursor-pointer ${
                      group.isCurrent
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-black dark:bg-slate-800 text-white dark:hover:bg-slate-700"
                    }`}
                  >
                    {group.isCurrent ? "Active Tier" : "Switch to Tier"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tab 3: Peer Candidate Leaderboard */}
        {activeTab === "leaderboard" && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            {/* Top 3 Podium */}
            {filteredLeaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-10 items-end max-w-3xl mx-auto pt-6">
                {/* 2nd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-3xl p-4 text-center relative flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-300 text-slate-800 font-black text-lg flex items-center justify-center -mt-8 mb-2 shadow-md">
                    2
                  </div>
                  <FaMedal size={24} className="text-slate-400 mb-1" />
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-full">
                    {filteredLeaderboard[1].name}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{filteredLeaderboard[1].targetRole}</p>
                  <p className="text-lg font-black text-slate-700 dark:text-slate-300 mt-2">
                    {filteredLeaderboard[1].overallRating}
                  </p>
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 rounded-3xl p-6 text-center relative flex flex-col items-center shadow-lg -mt-4"
                >
                  <div className="w-14 h-14 rounded-full bg-amber-400 text-slate-900 font-black text-xl flex items-center justify-center -mt-10 mb-2 shadow-lg">
                    <FaCrown size={22} className="text-amber-900" />
                  </div>
                  <h4 className="font-extrabold text-base text-gray-900 dark:text-white truncate max-w-full">
                    {filteredLeaderboard[0].name}
                  </h4>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{filteredLeaderboard[0].targetRole}</p>
                  <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                    RANK #1 CHAMPION
                  </span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                    {filteredLeaderboard[0].overallRating}
                  </p>
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-amber-500/10 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800/60 rounded-3xl p-4 text-center relative flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-600 text-white font-black text-lg flex items-center justify-center -mt-8 mb-2 shadow-md">
                    3
                  </div>
                  <FaMedal size={24} className="text-amber-700 mb-1" />
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-full">
                    {filteredLeaderboard[2].name}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{filteredLeaderboard[2].targetRole}</p>
                  <p className="text-lg font-black text-amber-700 dark:text-amber-400 mt-2">
                    {filteredLeaderboard[2].overallRating}
                  </p>
                </motion.div>
              </div>
            )}

            {/* Leaderboard Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-4">Rank</th>
                    <th className="py-4 px-4">Candidate</th>
                    <th className="py-4 px-4">Target Role & Tier</th>
                    <th className="py-4 px-4">Rating</th>
                    <th className="py-4 px-4">Percentile</th>
                    <th className="py-4 px-4">Mocks & Battles</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {filteredLeaderboard.map((item) => (
                    <tr
                      key={item._id}
                      className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 transition ${
                        item.isSelf ? "bg-emerald-50/50 dark:bg-emerald-950/20 font-semibold" : ""
                      }`}
                    >
                      <td className="py-4 px-4 font-extrabold text-base text-gray-900 dark:text-white">
                        {item.rank === 1 ? "🥇 #1" : item.rank === 2 ? "🥈 #2" : item.rank === 3 ? "🥉 #3" : `#${item.rank}`}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                              {item.name}
                              {item.isSelf && (
                                <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">YOU</span>
                              )}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {item.badges.slice(0, 2).map((b, i) => (
                                <span key={i} className="text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.2 rounded font-medium">
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-900 dark:text-white font-medium">{item.targetRole}</p>
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{item.difficultyTier}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          {item.overallRating}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 text-xs font-bold px-2.5 py-1 rounded-full">
                          Top {item.percentile}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                        <span>{item.interviewsCompleted} Mocks</span>
                        <span className="mx-1 text-gray-400">•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.battlesWon} Won</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedCandidate(item)}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer"
                        >
                          Compare Progress
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Side-by-Side Skill Comparison Modal */}
      <AnimatePresence>
        {selectedCandidate && userProfile && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedCandidate(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition cursor-pointer"
              >
                <FaTimes size={18} />
              </button>

              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <FaChartLine className="text-emerald-500" />
                <span>Side-by-Side Skill Comparison</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                Comparing your skill metrics with <strong>{selectedCandidate.name}</strong> ({selectedCandidate.targetRole})
              </p>

              {/* Metric Comparison Bars */}
              <div className="space-y-5">
                {/* Overall Rating */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-600 dark:text-emerald-400">You ({userProfile.overallRating})</span>
                    <span className="text-gray-500 uppercase">Overall Rating</span>
                    <span className="text-purple-600 dark:text-purple-400">{selectedCandidate.name} ({selectedCandidate.overallRating})</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${userProfile.overallRating}%` }} className="bg-emerald-500 h-full" />
                    <div style={{ width: `${selectedCandidate.overallRating}%` }} className="bg-purple-500 h-full opacity-60" />
                  </div>
                </div>

                {/* Coding Score */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-600 dark:text-emerald-400">You ({userProfile.codingScore || 80})</span>
                    <span className="text-gray-500 uppercase">Coding & Algorithms</span>
                    <span className="text-purple-600 dark:text-purple-400">{selectedCandidate.name} ({selectedCandidate.codingScore})</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${userProfile.codingScore || 80}%` }} className="bg-emerald-500 h-full" />
                    <div style={{ width: `${selectedCandidate.codingScore}%` }} className="bg-purple-500 h-full opacity-60" />
                  </div>
                </div>

                {/* System Design */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-600 dark:text-emerald-400">You ({userProfile.systemDesignScore || 82})</span>
                    <span className="text-gray-500 uppercase">System Architecture</span>
                    <span className="text-purple-600 dark:text-purple-400">{selectedCandidate.name} ({selectedCandidate.systemDesignScore})</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${userProfile.systemDesignScore || 82}%` }} className="bg-emerald-500 h-full" />
                    <div style={{ width: `${selectedCandidate.systemDesignScore}%` }} className="bg-purple-500 h-full opacity-60" />
                  </div>
                </div>
              </div>

              {/* Strengths & Gaps Comparison Grid */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-xs">
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900">
                  <p className="font-extrabold text-emerald-700 dark:text-emerald-300 mb-2">Their Strengths (You Can Learn)</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    {selectedCandidate.strengths?.map((str, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <FaCheckCircle className="text-emerald-500 shrink-0" size={10} />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-900">
                  <p className="font-extrabold text-purple-700 dark:text-purple-300 mb-2">Your Strengths (You Can Teach)</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    {userProfile.strengths?.map((str, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <FaCheckCircle className="text-purple-500 shrink-0" size={10} />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    const cand = selectedCandidate;
                    setSelectedCandidate(null);
                    setInviteCandidate(cand);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer flex items-center gap-2"
                >
                  <FaHandshake size={14} />
                  <span>Send Mock Partnership Request</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Request Modal */}
      <AnimatePresence>
        {inviteCandidate && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setInviteCandidate(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition cursor-pointer"
              >
                <FaTimes size={18} />
              </button>

              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <FaHandshake className="text-emerald-500" />
                <span>Invite {inviteCandidate.name}</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                Propose a peer 1v1 mock interview partnership session.
              </p>

              {inviteSuccess ? (
                <div className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 p-6 rounded-2xl text-center font-bold text-sm">
                  🎉 Invitation sent successfully! They will receive a notification.
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Mock Session Focus Topic
                    </label>
                    <input
                      type="text"
                      value={inviteTopic}
                      onChange={(e) => setInviteTopic(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Custom Note / Invitation Message
                    </label>
                    <textarea
                      rows={3}
                      value={inviteNote}
                      onChange={(e) => setInviteNote(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      onClick={() => setInviteCandidate(null)}
                      className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendInvite}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition shadow-md cursor-pointer"
                    >
                      Send Partnership Invite
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default CandidateMatchingLeaderboard;
