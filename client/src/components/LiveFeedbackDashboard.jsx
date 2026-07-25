import React from "react";
import { motion } from "motion/react";
import {
  FaEye,
  FaUserNinja,
  FaHandPaper,
  FaVolumeUp,
  FaWifi,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTachometerAlt,
  FaComments,
} from "react-icons/fa";

/**
 * Live Performance Metrics & Body Language Feedback Dashboard
 */
export default function LiveFeedbackDashboard({
  metrics = {},
  audioMetrics = {},
  isWsConnected = false,
  showWebcam = true,
  onToggleWebcam = () => {},
}) {
  const {
    wpm = 0,
    fillerWordsCount = 0,
    fillerWordsList = [],
    verbalConfidenceScore = 80,
    eyeContactScore = 85,
    eyeContactStatus = "Direct",
    postureScore = 90,
    postureStatus = "Upright",
    gestureCount = 0,
    bodyConfidenceScore = 88,
    overallConfidence = 86,
  } = metrics;

  const { volume = 0, toneQuality = "Steady Tone", frequencyData = [] } = audioMetrics;

  // Eye Contact badge styling
  const getEyeContactColor = () => {
    if (eyeContactStatus === "Direct")
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    if (eyeContactStatus === "Slight Drift")
      return "bg-amber-100 text-amber-700 border-amber-300";
    return "bg-rose-100 text-rose-700 border-rose-300";
  };

  // Posture badge styling
  const getPostureColor = () => {
    if (postureStatus === "Upright")
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    if (postureStatus === "Slouching")
      return "bg-rose-100 text-rose-700 border-rose-300";
    return "bg-amber-100 text-amber-700 border-amber-300";
  };

  return (
    <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-slate-800 shadow-xl p-5 space-y-6 transition-colors duration-300">
      {/* Top Bar: Header & WebSocket Telemetry Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold">
            <FaTachometerAlt size={18} />
          </span>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white text-base leading-tight">
              Real-Time Performance Dashboard
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Live AI speech, body language & streaming telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleWebcam}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition border ${
              showWebcam
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-gray-100 text-gray-600 border-gray-300 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700"
            }`}
          >
            {showWebcam ? "📷 Camera active" : "📷 Camera off"}
          </button>

          <span
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold border ${
              isWsConnected
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
            }`}
          >
            <FaWifi className={isWsConnected ? "animate-pulse text-emerald-500" : "text-amber-500"} />
            {isWsConnected ? "WebSocket Live" : "Connecting..."}
          </span>
        </div>
      </div>

      {/* Main Grid: Overall Confidence Meter & Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Overall Confidence Meter */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-800 rounded-2xl p-5 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start z-10">
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-100 font-bold">
                Live Confidence Meter
              </span>
              <h4 className="text-3xl font-extrabold mt-1">{overallConfidence}%</h4>
            </div>
            <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-semibold backdrop-blur-xs">
              Composite AI
            </span>
          </div>

          <div className="my-4 z-10">
            <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden p-0.5">
              <motion.div
                className="bg-white h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${overallConfidence}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-emerald-100 font-medium mt-1.5">
              <span>Speech Verbal: {verbalConfidenceScore}%</span>
              <span>Body Language: {bodyConfidenceScore}%</span>
            </div>
          </div>

          <p className="text-xs text-emerald-100 font-medium z-10">
            {overallConfidence >= 85
              ? "🌟 Excellent composure and speech pacing!"
              : overallConfidence >= 70
              ? "👍 Good steady rhythm. Keep posture upright."
              : "⚡ Focus on direct eye contact & steady pace."}
          </p>
        </div>

        {/* Card 2: AI Body Language & Pose Detection */}
        <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <FaUserNinja className="text-emerald-600 dark:text-emerald-400" /> Body Language AI
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {bodyConfidenceScore}% Score
            </span>
          </div>

          <div className="space-y-2">
            {/* Eye Contact */}
            <div className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-100 dark:border-slate-700 shadow-2xs">
              <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1.5">
                <FaEye className="text-emerald-500" /> Eye Contact
              </span>
              <span className={`px-2 py-0.5 rounded-full font-bold border ${getEyeContactColor()}`}>
                {eyeContactStatus} ({eyeContactScore}%)
              </span>
            </div>

            {/* Posture Detection */}
            <div className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-100 dark:border-slate-700 shadow-2xs">
              <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1.5">
                <FaUserNinja className="text-teal-500" /> Torso Posture
              </span>
              <span className={`px-2 py-0.5 rounded-full font-bold border ${getPostureColor()}`}>
                {postureStatus} ({postureScore}%)
              </span>
            </div>

            {/* Hand Gestures */}
            <div className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-100 dark:border-slate-700 shadow-2xs">
              <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1.5">
                <FaHandPaper className="text-purple-500" /> Hand Gestures
              </span>
              <span className="font-bold text-gray-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 text-purple-700 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                {gestureCount} detected
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Live Voice Tone & Audio Spectrum Visualizer */}
        <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <FaVolumeUp className="text-teal-600 dark:text-teal-400" /> Voice Tone Analysis
            </span>
            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
              {toneQuality}
            </span>
          </div>

          {/* Real-time Frequency Spectrum Waveform Bars */}
          <div className="flex items-end justify-between h-14 bg-white dark:bg-slate-900 rounded-xl p-2 border border-gray-100 dark:border-slate-700 gap-1 overflow-hidden">
            {frequencyData.length > 0
              ? frequencyData.map((val, idx) => {
                  const barHeight = Math.max(10, Math.min(100, (val / 255) * 100));
                  return (
                    <motion.div
                      key={idx}
                      className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-xs"
                      animate={{ height: `${barHeight}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  );
                })
              : Array.from({ length: 16 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-t-xs"
                  />
                ))}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-medium">
            <span>Mic Intensity: {volume}%</span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">Web Audio API</span>
          </div>
        </div>
      </div>

      {/* Speech Metrics Banner: WPM & Filler Words */}
      <div className="bg-emerald-50/70 dark:bg-slate-800/80 border border-emerald-200 dark:border-slate-700 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-xs border border-emerald-100 dark:border-slate-700 font-extrabold text-lg">
            {wpm} <span className="text-xs text-gray-400 font-normal">WPM</span>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-800 dark:text-white block">Speaking Pace</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {wpm >= 120 && wpm <= 160 ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <FaCheckCircle /> Optimal Pace (120-160 WPM)
                </span>
              ) : wpm > 0 && wpm < 120 ? (
                <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <FaExclamationTriangle /> Pace is slightly slow
                </span>
              ) : wpm > 160 ? (
                <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <FaExclamationTriangle /> Pace is fast - slow down
                </span>
              ) : (
                "Listening to microphone..."
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 rounded-xl shadow-xs border border-purple-100 dark:border-slate-700 font-extrabold text-lg flex items-center gap-1.5">
            <FaComments className="text-purple-500 text-sm" />
            {fillerWordsCount}
          </div>
          <div>
            <span className="text-xs font-bold text-gray-800 dark:text-white block">Filler Words</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {fillerWordsList.length > 0 ? (
                fillerWordsList.map((fw, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800"
                  >
                    "{fw}"
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Zero fillers detected ✨
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
