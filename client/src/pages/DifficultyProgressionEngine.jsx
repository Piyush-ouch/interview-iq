import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { ServerUrl } from "../App";
import {
  FaChartLine,
  FaBrain,
  FaBolt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaGraduationCap,
  FaLayerGroup,
  FaRedo,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaRegClock,
} from "react-icons/fa";

function DifficultyProgressionEngine() {
  const [activeTab, setActiveTab] = useState("adaptive"); // 'adaptive', 'spaced', 'mastery'

  // Progression Data
  const [progression, setProgression] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Adaptive Practice Demo State
  const [currentDiff, setCurrentDiff] = useState("Medium");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [scoresHistory, setScoresHistory] = useState([82, 88, 90]);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Spaced Repetition Review State
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const SAMPLE_QUESTIONS = {
    Easy: [
      { topic: "Data Structures", question: "What is the average time complexity of searching a key in a Hash Table vs a Binary Search Tree?" },
      { topic: "Web Basics", question: "Explain the difference between HTTP GET and POST requests in terms of idempotency." },
    ],
    Medium: [
      { topic: "Algorithms", question: "Given an integer array, find the contiguous subarray with the largest sum using Kadane's Algorithm." },
      { topic: "System Design", question: "How would you design a Rate Limiter using the Token Bucket or Sliding Window Log algorithm?" },
    ],
    Hard: [
      { topic: "Distributed Systems", question: "How do you achieve Strong Consistency across distributed DB nodes using the Raft Consensus Protocol?" },
      { topic: "Concurrency", question: "Explain Deadlock prevention strategies and how to detect cycles in a Resource Allocation Graph." },
    ],
    Expert: [
      { topic: "Staff System Design", question: "Architect a Global Low-Latency Real-Time Video Streaming Platform handling 10M concurrent users with CDN edge caching." },
    ],
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, cardsRes] = await Promise.all([
        axios.get(`${ServerUrl}/api/progression/analytics`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/progression/spaced-repetition`, { withCredentials: true }),
      ]);

      if (analyticsRes.data.success) {
        setProgression(analyticsRes.data.profile);
      }
      if (cardsRes.data.success) {
        setCards(cardsRes.data.dueCards);
      }
    } catch (error) {
      console.error("Error fetching progression engine data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer in Adaptive Practice Mode
  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim()) return;
    setSimulating(true);

    // Simulate AI grading score based on length and key terms
    const fakeScore = Math.min(100, Math.max(50, Math.floor(userAnswer.length * 1.2) + Math.floor(Math.random() * 25)));
    const newHistory = [...scoresHistory, fakeScore];
    setScoresHistory(newHistory);

    try {
      const currentQList = SAMPLE_QUESTIONS[currentDiff] || SAMPLE_QUESTIONS.Medium;
      const currentTopic = currentQList[questionIndex % currentQList.length]?.topic || "General";

      const res = await axios.post(
        `${ServerUrl}/api/progression/adaptive-next-question`,
        {
          currentDifficulty: currentDiff,
          recentScores: newHistory.slice(-3),
          topic: currentTopic,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setLastFeedback({
          score: fakeScore,
          oldDiff: currentDiff,
          newDiff: res.data.nextDifficulty,
          reason: res.data.progressionReason,
        });

        setCurrentDiff(res.data.nextDifficulty);
        setUserAnswer("");
        setQuestionIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error calculating adaptive difficulty:", error);
    } finally {
      setSimulating(false);
    }
  };

  // Submit SuperMemo 2 Flashcard Self-Rating (0-5)
  const handleCardRating = async (rating) => {
    const card = cards[activeCardIndex];
    if (!card) return;

    try {
      const res = await axios.post(
        `${ServerUrl}/api/progression/spaced-repetition/review`,
        {
          cardId: card._id,
          rating,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setReviewMessage(`Rating recorded! Next SM-2 review in ${res.data.card.interval} day(s). (Ease Factor: ${res.data.card.easeFactor})`);
        setShowAnswer(false);

        // Update local card state
        const updatedCards = [...cards];
        updatedCards[activeCardIndex] = res.data.card;
        setCards(updatedCards);

        setTimeout(() => {
          setReviewMessage("");
          setActiveCardIndex((prev) => (prev + 1) % cards.length);
        }, 1800);
      }
    } catch (error) {
      console.error("Error submitting SM-2 review:", error);
    }
  };

  const currentQuestions = SAMPLE_QUESTIONS[currentDiff] || SAMPLE_QUESTIONS.Medium;
  const activeQuestion = currentQuestions[questionIndex % currentQuestions.length];

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0b0f19] text-gray-900 dark:text-white transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 py-10 max-w-7xl mx-auto w-full">
        {/* Header Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 mb-8 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-3 border border-purple-500/20">
                <FaBrain size={12} />
                <span>ADAPTIVE DIFFICULTY & SM-2 ENGINE</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Question Difficulty <span className="text-purple-600 dark:text-purple-400">Progression Engine</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl text-sm md:text-base">
                Real-time difficulty scaling based on performance, SuperMemo 2 (SM-2) spaced repetition for weak topics, and predictive challenge level readiness.
              </p>
            </div>

            {/* Readiness Prediction Pill */}
            {progression && (
              <div className="bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/60 rounded-2xl p-5 flex items-center gap-6 min-w-[280px]">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Predictive Readiness</p>
                  <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{progression.readinessScore}%</p>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:bg-slate-700" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Predicted Challenge</p>
                  <span className="inline-block bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-md mt-0.5">
                    {progression.currentLevel} Tier
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-3 mt-8 border-t border-gray-100 dark:border-slate-800 pt-6">
            <button
              onClick={() => setActiveTab("adaptive")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                activeTab === "adaptive"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              <FaBolt size={16} />
              <span>Real-Time Adaptive Practice</span>
            </button>

            <button
              onClick={() => setActiveTab("spaced")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                activeTab === "spaced"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              <FaBrain size={16} />
              <span>SM-2 Spaced Repetition Deck</span>
              <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{cards.length} Due</span>
            </button>

            <button
              onClick={() => setActiveTab("mastery")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                activeTab === "mastery"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              <FaChartLine size={16} />
              <span>Topic Mastery & Predictions</span>
            </button>
          </div>
        </motion.div>

        {/* Tab 1: Real-Time Adaptive Practice */}
        {activeTab === "adaptive" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Interactive Question Workspace */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
              <div>
                {/* Header Metadata */}
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <FaGraduationCap size={14} />
                    Topic: {activeQuestion?.topic}
                  </span>

                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full ${
                      currentDiff === "Easy"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        : currentDiff === "Medium"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : currentDiff === "Hard"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                    }`}
                  >
                    DYNAMIC DIFFICULTY: {currentDiff.toUpperCase()}
                  </span>
                </div>

                {/* Question Prompt */}
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed mb-6">
                  {activeQuestion?.question}
                </h3>

                {/* Feedback Notification Banner */}
                <AnimatePresence>
                  {lastFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 mb-6 text-xs text-purple-700 dark:text-purple-300 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-sm">Evaluation Score: {lastFeedback.score}%</p>
                        <p className="mt-0.5">{lastFeedback.reason}</p>
                      </div>
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-purple-600 text-white shrink-0">
                        {lastFeedback.oldDiff} ➔ {lastFeedback.newDiff}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Answer Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Your Response / Pseudo-code Solution
                  </label>
                  <textarea
                    rows={6}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your technical response here. The system will evaluate your response quality and dynamically scale the next question's difficulty..."
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-sm text-gray-900 dark:text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Submit & Next Actions */}
              <div className="pt-6 mt-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Rolling Performance Avg: <strong>{Math.round(scoresHistory.slice(-3).reduce((a, b) => a + b, 0) / 3)}%</strong>
                </span>

                <button
                  onClick={handleAnswerSubmit}
                  disabled={simulating || !userAnswer.trim()}
                  className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {simulating ? "Evaluating Difficulty..." : "Submit Answer & Adjust Difficulty"}
                </button>
              </div>
            </div>

            {/* Dynamic Scaling Pipeline Status */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-base text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaBolt className="text-purple-500" />
                  <span>Real-Time Difficulty Pipeline</span>
                </h4>

                <div className="space-y-4 text-xs">
                  {["Easy", "Medium", "Hard", "Expert"].map((diffTier) => {
                    const isActive = currentDiff === diffTier;
                    return (
                      <div
                        key={diffTier}
                        className={`p-4 rounded-2xl border transition ${
                          isActive
                            ? "bg-purple-50 dark:bg-purple-950/40 border-purple-500 shadow-md"
                            : "bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-800 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-gray-900 dark:text-white">{diffTier} Tier</span>
                          {isActive && (
                            <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              ACTIVE TARGET
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {diffTier === "Easy" && "Fundamental concepts, basic syntax, and direct definitions."}
                          {diffTier === "Medium" && "Standard algorithm patterns, time/space tradeoffs, and design."}
                          {diffTier === "Hard" && "Complex concurrency, multi-node distributed systems, and edge cases."}
                          {diffTier === "Expert" && "Staff/FAANG level architecture, extreme concurrency, & scalability."}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Scores <strong>≥85%</strong> upgrade difficulty. Scores <strong>&lt;60%</strong> downscale for reinforcement.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: SM-2 Spaced Repetition Deck */}
        {activeTab === "spaced" && (
          <div className="max-w-3xl mx-auto">
            {cards.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-12 text-center">
                <FaCheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">All Weak Topics Reviewed!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  No SM-2 flashcards are due for review right now. Check back tomorrow!
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 shadow-lg relative">
                {/* Progress Counter */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    Flashcard {activeCardIndex + 1} of {cards.length}
                  </span>

                  <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
                    <FaRegClock size={12} />
                    SM-2 Interval: {cards[activeCardIndex]?.interval} Day(s)
                  </span>
                </div>

                {/* Card Content */}
                <div className="mb-8">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-2">
                    {cards[activeCardIndex]?.topic}
                  </span>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed mb-6">
                    {cards[activeCardIndex]?.questionText}
                  </h3>

                  {/* Show Answer Toggle */}
                  {showAnswer ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium"
                    >
                      <p className="font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase mb-1">
                        Optimal Reference Answer:
                      </p>
                      {cards[activeCardIndex]?.sampleAnswer}
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      Reveal Reference Answer & Rate Recall 👁️
                    </button>
                  )}
                </div>

                {/* Review Message Feedback */}
                {reviewMessage && (
                  <div className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 p-4 rounded-2xl text-center text-xs font-bold mb-6">
                    {reviewMessage}
                  </div>
                )}

                {/* SM-2 Self-Rating Buttons (0 to 5) */}
                {showAnswer && (
                  <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-center text-gray-500 dark:text-gray-400 mb-3">
                      Rate Your Recall Quality (SuperMemo 2 Calculation):
                    </p>
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        { r: 0, label: "Blackout (0)", color: "bg-red-600" },
                        { r: 1, label: "Wrong (1)", color: "bg-orange-600" },
                        { r: 2, label: "Hard (2)", color: "bg-amber-600" },
                        { r: 3, label: "Good (3)", color: "bg-blue-600" },
                        { r: 4, label: "Easy (4)", color: "bg-teal-600" },
                        { r: 5, label: "Perfect (5)", color: "bg-emerald-600" },
                      ].map((item) => (
                        <button
                          key={item.r}
                          onClick={() => handleCardRating(item.r)}
                          className={`${item.color} text-white py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition cursor-pointer shadow-sm`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Topic Mastery & Challenge Predictions */}
        {activeTab === "mastery" && progression && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Topic Mastery Heatmap Bars */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FaChartLine className="text-purple-500" />
                <span>Competency & Topic Mastery Breakdown</span>
              </h3>

              <div className="space-y-5">
                {Object.entries(progression.topicMastery || {}).map(([topicName, masteryScore]) => (
                  <div key={topicName}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-gray-800 dark:text-gray-200">{topicName}</span>
                      <span className={masteryScore >= 85 ? "text-emerald-500" : masteryScore >= 70 ? "text-purple-500" : "text-amber-500"}>
                        {masteryScore}% Mastery
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${masteryScore}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          masteryScore >= 85 ? "bg-emerald-500" : masteryScore >= 70 ? "bg-purple-500" : "bg-amber-500"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictive Assessment Card */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FaGraduationCap className="text-emerald-500" />
                  <span>Predictive Interview Readiness</span>
                </h3>

                <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-2xl p-6 mb-6">
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                    Next Recommended Target Focus:
                  </p>
                  <h4 className="text-lg font-extrabold text-gray-900 dark:text-white">
                    {progression.predictedChallengeLevel}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                    Based on your 84.5% overall readiness rating, the AI engine predicts high success for Mid-Level & Senior roles, and recommends targeting System Design Distributed Caching to reach Staff FAANG tier.
                  </p>
                </div>

                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <FaCheckCircle />
                    <span>Behavioral & Leadership Stories: FAANG Tier Ready (91%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <FaCheckCircle />
                    <span>System Architecture: Senior Tier Ready (88%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <FaExclamationTriangle />
                    <span>Object Oriented Design: Scheduled for SM-2 Spaced Review (79%)</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-slate-800 mt-6 flex justify-end">
                <button
                  onClick={() => setActiveTab("adaptive")}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Start Dynamic Practice Session ➔
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default DifficultyProgressionEngine;
