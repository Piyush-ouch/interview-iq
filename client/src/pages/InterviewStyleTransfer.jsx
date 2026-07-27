import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { ServerUrl } from "../App";
import {
  FaTheaterMasks,
  FaUserTie,
  FaUserNinja,
  FaHeart,
  FaSmile,
  FaPaperPlane,
  FaRobot,
  FaStar,
  FaExchangeAlt,
  FaCheckCircle,
  FaComments,
} from "react-icons/fa";

function InterviewStyleTransfer() {
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulation Studio State
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${ServerUrl}/api/personality/profiles`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setPersonas(res.data.personas);
        const current = res.data.personas.find((p) => p.id === res.data.currentPersonality) || res.data.personas[0];
        setSelectedPersona(current);

        // Set initial conversation item
        setConversationHistory([
          {
            sender: "interviewer",
            name: current.name,
            title: current.title,
            text: current.sampleQuestion,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching personality profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPersona = (persona) => {
    setSelectedPersona(persona);
    setConversationHistory([
      {
        sender: "interviewer",
        name: persona.name,
        title: persona.title,
        text: persona.sampleQuestion,
      },
    ]);
  };

  const handleSendAnswer = async () => {
    if (!candidateAnswer.trim() || !selectedPersona) return;
    setSimulating(true);

    const userText = candidateAnswer;
    setCandidateAnswer("");

    // Append candidate message
    const updatedHistory = [
      ...conversationHistory,
      {
        sender: "user",
        text: userText,
      },
    ];
    setConversationHistory(updatedHistory);

    try {
      const res = await axios.post(
        `${ServerUrl}/api/personality/transform-style`,
        {
          personalityId: selectedPersona.id,
          question: conversationHistory[conversationHistory.length - 1]?.text || "",
          candidateAnswer: userText,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setConversationHistory((prev) => [
          ...prev,
          {
            sender: "interviewer",
            name: res.data.personaName,
            title: res.data.personaTitle,
            text: res.data.personaResponse,
            score: res.data.score,
            toneAnalysis: res.data.toneAnalysis,
          },
        ]);
      }
    } catch (error) {
      console.error("Error generating style transfer response:", error);
    } finally {
      setSimulating(false);
    }
  };

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
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-3 border border-teal-500/20">
              <FaTheaterMasks size={14} />
              <span>AI PERSONALITY & STYLE TRANSFER</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              AI Interviewer <span className="text-teal-600 dark:text-teal-400">Style Transfer</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl text-sm md:text-base">
              Practice technical interviews with different interviewer personas—ranging from casual tech leads and strict formal directors to aggressive high-pressure stress testers.
            </p>
          </div>
        </motion.div>

        {/* Persona Selector Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {personas.map((persona) => {
            const isSelected = selectedPersona?.id === persona.id;
            return (
              <motion.div
                key={persona.id}
                whileHover={{ y: -4 }}
                onClick={() => handleSelectPersona(persona)}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 cursor-pointer transition-all shadow-sm flex flex-col justify-between ${
                  isSelected
                    ? "border-teal-500 ring-2 ring-teal-500/30 dark:ring-teal-500/20 shadow-lg"
                    : "border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${persona.avatarColor}`}>
                      {persona.badge}
                    </span>

                    {isSelected && (
                      <span className="text-xs text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1">
                        <FaCheckCircle /> ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${persona.avatarColor} text-white font-black text-lg flex items-center justify-center shadow-md`}>
                      {persona.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                        {persona.name}
                      </h4>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{persona.title}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                    {persona.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 text-right">
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
                    {isSelected ? "Practicing Now ➔" : "Select Persona ➔"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live Simulation Workspace */}
        {selectedPersona && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${selectedPersona.avatarColor} text-white font-bold flex items-center justify-center`}>
                  {selectedPersona.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Live Session with {selectedPersona.name}
                  </h3>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                    {selectedPersona.title} ({selectedPersona.badge})
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleSelectPersona(selectedPersona)}
                className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <FaComments size={12} />
                <span>Reset Chat</span>
              </button>
            </div>

            {/* Chat Conversation Thread */}
            <div className="space-y-4 max-h-[480px] overflow-y-auto p-4 bg-gray-50 dark:bg-slate-950/60 rounded-2xl border border-gray-100 dark:border-slate-800 mb-6">
              {conversationHistory.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${item.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed ${
                      item.sender === "user"
                        ? "bg-teal-600 text-white font-medium rounded-br-none"
                        : "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {item.sender === "interviewer" && (
                      <div className="flex items-center gap-2 mb-1.5 border-b border-gray-100 dark:border-slate-800 pb-1 text-xs">
                        <span className="font-bold text-teal-600 dark:text-teal-400">{item.name}</span>
                        <span className="text-[10px] text-gray-400 font-normal">({item.title})</span>
                      </div>
                    )}
                    <p>{item.text}</p>

                    {item.toneAnalysis && (
                      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-slate-800 text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center justify-between">
                        <span>Tone Score: {item.score}%</span>
                        <span className="text-gray-400 text-[11px] font-normal">{item.toneAnalysis}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {simulating && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 animate-pulse p-2">
                  <FaRobot className="text-teal-500" />
                  <span>{selectedPersona.name} is formulating an in-character response...</span>
                </div>
              )}
            </div>

            {/* Answer Input Controls */}
            <div className="flex items-center gap-3">
              <textarea
                rows={2}
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendAnswer();
                  }
                }}
                placeholder={`Respond to ${selectedPersona.name} in your own words... (Press Enter to Send)`}
                className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-teal-500 resize-none font-medium"
              />
              <button
                onClick={handleSendAnswer}
                disabled={simulating || !candidateAnswer.trim()}
                className="px-6 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <FaPaperPlane size={14} />
                <span>Respond</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default InterviewStyleTransfer;
