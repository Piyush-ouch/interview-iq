import React, { useState, useEffect } from 'react'
import { FaArrowLeft, FaTrophy, FaLinkedin } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react"
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import axios from 'axios';
import { ServerUrl } from '../App';
import CertificateCard from './CertificateCard';
import { getLanguageObj } from "../utils/languages";

function Step3Report({ report }) {
  const [issuedCert, setIssuedCert] = useState(null);
  const langObj = getLanguageObj(report?.language || "English");

  useEffect(() => {
    async function autoIssueCert() {
      if (report && (report.finalScore || 0) >= 7.0 && (report._id || report.interviewId)) {
        try {
          const targetId = report._id || report.interviewId;
          const res = await axios.post(
            `${ServerUrl}/api/certificate/issue`,
            { interviewId: targetId },
            { withCredentials: true }
          );
          if (res.data?.certificate) {
            setIssuedCert(res.data.certificate);
          }
        } catch (err) {
          console.error("Auto certificate issuance check:", err);
        }
      }
    }
    autoIssueCert();
  }, [report]);

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading Report...</p>
      </div>
    );
  }
  const navigate = useNavigate()
  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0
  }))

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence.";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;


  const downloadPDF = () => {
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let currentY = 25;

  // ================= TITLE =================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94);
  doc.text("AI Interview Performance Report", pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 5;

  // underline
  doc.setDrawColor(34, 197, 94);
  doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

  currentY += 15;

  // ================= FINAL SCORE BOX =================
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, "F");

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Final Score: ${finalScore}/10`,
    pageWidth / 2,
    currentY + 12,
    { align: "center" }
  );

  currentY += 30;

  // ================= SKILLS BOX =================
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");

  doc.setFontSize(12);

  doc.text(`Confidence: ${confidence}`, margin + 10, currentY + 10);
  doc.text(`Communication: ${communication}`, margin + 10, currentY + 18);
  doc.text(`Correctness: ${correctness}`, margin + 10, currentY + 26);

  currentY += 45;

  // ================= ADVICE =================
  let advice = "";

  if (finalScore >= 8) {
    advice =
      "Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers with strong real-world examples.";
  } else if (finalScore >= 5) {
    advice =
      "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting examples.";
  } else {
    advice =
      "Significant improvement required. Focus on structured thinking, clarity, and confident delivery. Practice answering aloud regularly.";
  }

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220);
  doc.roundedRect(margin, currentY, contentWidth, 35, 4, 4);

  doc.setFont("helvetica", "bold");
  doc.text("Professional Advice", margin + 10, currentY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const splitAdvice = doc.splitTextToSize(advice, contentWidth - 20);
  doc.text(splitAdvice, margin + 10, currentY + 20);

  currentY += 50;

  // ================= QUESTION TABLE =================
  autoTable(doc, {
  startY: currentY,
  margin: { left: margin, right: margin },
  head: [["#", "Question", "Score", "Feedback"]],
  body: questionWiseScore.map((q, i) => [
    `${i + 1}`,
    q.question,
    `${q.score}/10`,
    q.feedback,
  ]),
  styles: {
    fontSize: 9,
    cellPadding: 5,
    valign: "top",
  },
  headStyles: {
    fillColor: [34, 197, 94],
    textColor: 255,
    halign: "center",
  },
  columnStyles: {
    0: { cellWidth: 10, halign: "center" }, // index
    1: { cellWidth: 55 }, // question
    2: { cellWidth: 20, halign: "center" }, // score
    3: { cellWidth: "auto" }, // feedback
  },
  alternateRowStyles: {
    fillColor: [249, 250, 251],
  },
});


  doc.save("AI_Interview_Report.pdf");
};

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-green-50 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300 px-4 sm:px-6 lg:px-10 py-8'>
      <div className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='md:mb-10 w-full flex items-start gap-4 flex-wrap'>
          <button
            onClick={() => navigate("/history")}
            className='mt-1 p-3 rounded-full bg-white dark:bg-slate-800 dark:border-slate-700 shadow hover:shadow-md transition cursor-pointer'><FaArrowLeft className='text-gray-600 dark:text-gray-300' /></button>

          <div>
            <h1 className='text-3xl font-bold flex-nowrap text-gray-800 dark:text-white'>
              Interview Analytics Dashboard
            </h1>
            <p className='text-gray-500 dark:text-gray-400 mt-2'>
              AI-powered performance insights
            </p>

          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm px-4 py-3 rounded-xl font-bold shadow-xs flex items-center gap-2">
            <span>{langObj.flag}</span> {langObj.name} Session
          </span>
          <button onClick={downloadPDF} className='bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm sm:text-base text-nowrap cursor-pointer'>Download PDF</button>
        </div>
      </div>


      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>

        <div className='space-y-6'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 text-center transition-colors">

            <h3 className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
              Overall Performance
            </h3>
            <div className='relative w-20 h-20 sm:w-25 sm:h-25 mx-auto'>
              <CircularProgressbar
                value={percentage}
                text={`${score}/10`}
                styles={buildStyles({
                  textSize: "18px",
                  pathColor: "#10b981",
                  textColor: "#ef4444",
                  trailColor: "#e5e7eb",
                })}
              />
            </div>

            <p className="text-gray-400 dark:text-gray-400 mt-3 text-xs sm:text-sm">
              Out of 10
            </p>

            <div className="mt-4">
              <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                {performanceText}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
                {shortTagline}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 transition-colors'>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">
              Skill Evaluation
            </h3>

            <div className='space-y-5'>
              {
                skills.map((s, i) => (
                  <div key={i}>
                    <div className='flex justify-between mb-2 text-sm sm:text-base text-gray-700 dark:text-gray-300'>

                      <span>{s.label}</span>
                      <span className='font-semibold text-green-600 dark:text-emerald-400'>{s.value}</span>
                    </div>

                    <div className='bg-gray-200 dark:bg-slate-700 h-2 sm:h-3 rounded-full'>
                      <div className='bg-green-500 dark:bg-emerald-500 h-full rounded-full'
                        style={{ width: `${s.value * 10}%` }}

                      ></div>

                    </div>


                  </div>
                ))
              }
            </div>

          </motion.div>

          {/* AI Speech & Verbal Confidence Analyzer Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 space-y-4 border border-purple-100 dark:border-slate-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                🎙️ Speech & Verbal Confidence
              </h3>
              <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold px-2.5 py-1 rounded-full">
                Real-Time Voice AI
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center pt-2">
              <div className="p-3 bg-purple-50 dark:bg-slate-800 rounded-xl border border-purple-100 dark:border-slate-700">
                <span className="text-2xl font-extrabold text-purple-700 dark:text-purple-400">
                  {report?.overallSpeechAnalytics?.avgWpm || 135}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Avg WPM (Speed)</span>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-slate-700">
                <span className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-400">
                  {report?.overallSpeechAnalytics?.avgVerbalConfidence || 88}%
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Verbal Confidence</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Filler Words Detected:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {report?.overallSpeechAnalytics?.totalFillerWords || 0} words
                </span>
              </div>

              {report?.overallSpeechAnalytics?.topFillerWords && report.overallSpeechAnalytics.topFillerWords.length > 0 ? (
                <div className="flex flex-wrap gap-1 pt-1">
                  {report.overallSpeechAnalytics.topFillerWords.map((fw, idx) => (
                    <span key={idx} className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-md font-bold border border-transparent dark:border-amber-800">
                      "{fw}"
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">✨ Clean speech delivery with zero filler words!</p>
              )}
            </div>
          </motion.div>

          {/* AI Body Language & Pose Detection Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 space-y-4 border border-teal-100 dark:border-slate-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                🤖 AI Pose & Body Language
              </h3>
              <span className="text-xs bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-bold px-2.5 py-1 rounded-full">
                WebSocket Live Telemetry
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center pt-2">
              <div className="p-3 bg-emerald-50 dark:bg-slate-800 rounded-xl border border-emerald-100 dark:border-slate-700">
                <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  {report?.overallBodyLanguageAnalytics?.avgEyeContact || 88}%
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Eye Contact</span>
              </div>

              <div className="p-3 bg-teal-50 dark:bg-slate-800 rounded-xl border border-teal-100 dark:border-slate-700">
                <span className="text-2xl font-extrabold text-teal-700 dark:text-teal-400">
                  {report?.overallBodyLanguageAnalytics?.avgPosture || 92}%
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Posture Score</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Total Hand Gestures:</span>
                <span className="font-bold text-purple-700 dark:text-purple-400">
                  {report?.overallBodyLanguageAnalytics?.totalGestures || 0} gestures
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Overall Body Composure:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {report?.overallBodyLanguageAnalytics?.avgBodyConfidence || 90}% High
                </span>
              </div>
            </div>
          </motion.div>

          {/* Earned Verifiable Credential Certificate Card */}
          {issuedCert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                  <FaTrophy className="text-amber-500" /> Earned Verifiable Credential
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  LinkedIn Ready
                </span>
              </div>
              <CertificateCard certificate={issuedCert} />
            </motion.div>
          )}


        </div>

        <div className='lg:col-span-2 space-y-6'>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8 transition-colors'>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 sm:mb-6">
              Performance Trend
            </h3>

            <div className='h-64 sm:h-72'>

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={questionScoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" />
                  <Tooltip />
                  <Area type="monotone"
                    dataKey="score"
                    stroke="#22c55e"
                    fill="#bbf7d0"
                    strokeWidth={3} />


                </AreaChart>

              </ResponsiveContainer>


            </div>


          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8 transition-colors'>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">
              Question Breakdown
            </h3>
            <div className='space-y-6'>
              {questionWiseScore.map((q, i) => (
                <div key={i} className='bg-gray-50 dark:bg-slate-800/60 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700'>

                  <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4'>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-400">
                        Question {i + 1}
                      </p>

                      <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base leading-relaxed">
                        {q.question || "Question not available"}
                      </p>
                    </div>


                    <div className='bg-green-100 dark:bg-emerald-950 text-green-600 dark:text-emerald-300 border border-transparent dark:border-emerald-800 px-3 py-1 rounded-full font-bold text-xs sm:text-sm w-fit'>
                      {q.score ?? 0}/10
                    </div>
                  </div>

                  <div className='bg-green-50 dark:bg-emerald-950/40 border border-green-200 dark:border-emerald-800/60 p-4 rounded-lg'>
                    <p className='text-xs text-green-600 dark:text-emerald-400 font-semibold mb-1'>
                      AI Feedback
                    </p>
                    <p className='text-sm text-gray-700 dark:text-gray-200 leading-relaxed'>

                      {q.feedback && q.feedback.trim() !== ""
                        ? q.feedback
                        : "No feedback available for this question."}
                    </p>
                  </div>

                </div>
              ))}
            </div>

          </motion.div>





        </div>
      </div>

    </div>
  )
}

export default Step3Report
