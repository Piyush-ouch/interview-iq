import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import Navbar from "../components/Navbar";
import {
  FaFileUpload,
  FaArrowLeft,
  FaFilePdf,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaBriefcase,
  FaCopy,
  FaMagic,
  FaShieldAlt,
  FaTags,
  FaArrowRight,
  FaPlay,
  FaListAlt,
} from "react-icons/fa";

function ResumeOptimizer() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [targetJobDescription, setTargetJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [report, setReport] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [activeTab, setActiveTab] = useState("ats"); // 'ats', 'keywords', 'rewriter', 'suggestions'
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setErrorMsg("Please upload a valid PDF file (.pdf).");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMsg("File size exceeds 5MB limit.");
        return;
      }
      setFile(selectedFile);
      setErrorMsg("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Please select a PDF resume file to analyze.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("targetRole", targetRole);
      formData.append("targetJobDescription", targetJobDescription);

      const response = await axios.post(`${ServerUrl}/api/resume-optimizer/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.data.success) {
        setReport(response.data.report);
        setResumeText(response.data.resumeText);
      }
    } catch (err) {
      console.error("Resume optimization error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const startInterviewFromResume = () => {
    navigate("/interview", {
      state: {
        role: targetRole || "Software Engineer",
        experience: "Intermediate (1-3 yrs)",
        mode: "Technical",
        resumeText,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition shadow-xs cursor-pointer"
              title="Go Back"
            >
              <FaArrowLeft size={14} />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <FaMagic className="text-purple-600" />
                AI Resume Optimizer & ATS Review
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Score your resume, check ATS compliance, extract missing keywords, and get line-by-line bullet rewrites.
              </p>
            </div>
          </div>
        </div>

        {/* Form Input Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Upload Zone */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <FaFilePdf className="text-red-500" /> Upload Resume (PDF)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-purple-500 transition bg-gray-50/50">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-pdf-input"
                  />
                  <label htmlFor="resume-pdf-input" className="cursor-pointer space-y-2 block">
                    <FaFileUpload className="mx-auto text-gray-400 text-3xl" />
                    <p className="text-xs font-semibold text-gray-700">
                      {file ? file.name : "Click or drag & drop PDF resume here"}
                    </p>
                    <p className="text-[11px] text-gray-400">Maximum file size: 5MB</p>
                  </label>
                </div>
              </div>

              {/* Target Role & Job Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <FaBriefcase className="text-gray-400" /> Target Job Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Developer, Full Stack Engineer, Data Scientist"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Target Job Description (Optional for Keyword Match)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Paste job posting text here to analyze keyword match density..."
                    value={targetJobDescription}
                    onChange={(e) => setTargetJobDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  ></textarea>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <FaExclamationTriangle /> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? (
                "Analyzing Resume & Checking ATS Compliance..."
              ) : (
                <>
                  <FaMagic /> Analyze & Optimize Resume Now
                </>
              )}
            </button>
          </form>
        </div>

        {/* RESULTS DASHBOARD */}
        {report && (
          <div className="space-y-8">
            {/* Multi-Vector Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs text-center">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Overall Score</p>
                <p className="text-4xl font-extrabold text-purple-700">{report.scores.overall}</p>
                <p className="text-[11px] text-gray-400 mt-1">Combined Quality Rating</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs text-center">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ATS Compatibility</p>
                <p className="text-4xl font-extrabold text-blue-600">{report.scores.ats}</p>
                <p className="text-[11px] text-gray-400 mt-1">Parser Readability Rating</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs text-center">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Impact & Verbs</p>
                <p className="text-4xl font-extrabold text-emerald-600">{report.scores.impact}</p>
                <p className="text-[11px] text-gray-400 mt-1">Action Verb & Metrics Strength</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs text-center">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Keyword Match</p>
                <p className="text-4xl font-extrabold text-amber-600">{report.scores.keywordMatch}%</p>
                <p className="text-[11px] text-gray-400 mt-1">JD Skill Keyword Coverage</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 gap-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab("ats")}
                className={`py-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
                  activeTab === "ats"
                    ? "border-purple-600 text-purple-700"
                    : "border-transparent text-gray-500 hover:text-black"
                }`}
              >
                <FaShieldAlt /> ATS Formatting
              </button>

              <button
                onClick={() => setActiveTab("keywords")}
                className={`py-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
                  activeTab === "keywords"
                    ? "border-purple-600 text-purple-700"
                    : "border-transparent text-gray-500 hover:text-black"
                }`}
              >
                <FaTags /> Keyword Optimization
              </button>

              <button
                onClick={() => setActiveTab("rewriter")}
                className={`py-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
                  activeTab === "rewriter"
                    ? "border-purple-600 text-purple-700"
                    : "border-transparent text-gray-500 hover:text-black"
                }`}
              >
                <FaMagic /> AI Bullet Rewriter
              </button>

              <button
                onClick={() => setActiveTab("suggestions")}
                className={`py-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
                  activeTab === "suggestions"
                    ? "border-purple-600 text-purple-700"
                    : "border-transparent text-gray-500 hover:text-black"
                }`}
              >
                <FaListAlt /> Improvement Recommendations
              </button>
            </div>

            {/* TAB 1: ATS Formatting */}
            {activeTab === "ats" && (
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <FaShieldAlt className="text-blue-600" /> ATS Compatibility Assessment
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      report.atsFormatting.atsFriendly
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {report.atsFormatting.atsFriendly ? "ATS Friendly Layout" : "Action Required"}
                  </span>
                </div>

                {report.atsFormatting.warnings && report.atsFormatting.warnings.length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
                    <p className="font-bold flex items-center gap-1.5 text-amber-800">
                      <FaExclamationTriangle /> Parsing Warnings to Avoid:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {report.atsFormatting.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <p className="font-bold text-gray-800">Best Practices Recommendations:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {report.atsFormatting.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2">
                        <FaCheckCircle className="text-emerald-500 mt-0.5" />
                        <span className="text-gray-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Keyword Optimization */}
            {activeTab === "keywords" && (
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <FaTags className="text-amber-500" /> Keyword Coverage & Density
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Matched Keywords */}
                  <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                    <p className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <FaCheckCircle className="text-emerald-600" /> Matched Keywords Found ({report.keywordOptimization.matchedKeywords.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.keywordOptimization.matchedKeywords.map((k) => (
                        <span key={k} className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="p-5 bg-red-50/50 border border-red-200 rounded-2xl space-y-3">
                    <p className="text-xs font-extrabold text-red-900 flex items-center gap-1.5">
                      <FaExclamationTriangle className="text-red-600" /> Missing High-Impact Keywords ({report.keywordOptimization.missingKeywords.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.keywordOptimization.missingKeywords.map((k) => (
                        <span key={k} className="px-2.5 py-1 bg-white border border-red-300 text-red-800 rounded-lg text-xs font-semibold">
                          + {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {report.keywordOptimization.optimizationTips && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-1.5">
                    <p className="font-bold text-gray-900">Optimization Advice:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {report.keywordOptimization.optimizationTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: AI Bullet Point Rewriter */}
            {activeTab === "rewriter" && (
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <FaMagic className="text-purple-600" /> Line-by-Line Bullet Point Rewriter
                </h3>
                <p className="text-xs text-gray-500">
                  Transform weak resume statements into high-impact, metric-driven bullet points.
                </p>

                <div className="space-y-4">
                  {report.bulletPointRewrites.map((item, idx) => (
                    <div key={idx} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block mb-1">Original Bullet:</span>
                        <p className="text-xs text-gray-600 italic bg-white p-2.5 rounded-xl border border-gray-200">
                          "{item.original}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-purple-600 text-xs font-bold my-1">
                        <FaArrowRight size={12} /> AI Optimized Replacement:
                      </div>

                      <div className="bg-purple-50/70 border border-purple-200 p-3.5 rounded-xl flex items-center justify-between gap-4">
                        <p className="text-xs font-semibold text-purple-950 leading-relaxed">
                          "{item.optimized}"
                        </p>
                        <button
                          onClick={() => copyToClipboard(item.optimized, idx)}
                          className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <FaCopy size={11} /> {copiedIndex === idx ? "Copied!" : "Copy"}
                        </button>
                      </div>

                      {item.reason && (
                        <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                          <FaLightbulb className="text-amber-500" /> <strong>Rationale:</strong> {item.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Improvement Suggestions */}
            {activeTab === "suggestions" && (
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <FaListAlt className="text-blue-600" /> Actionable Improvement Recommendations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="p-4 bg-red-50/60 border border-red-200 rounded-2xl space-y-2">
                    <p className="font-bold text-red-900 flex items-center gap-1.5">
                      <FaExclamationTriangle className="text-red-600" /> Critical Fixes
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-red-950">
                      {report.improvementSuggestions.criticalFixes.map((f, idx) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                    <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <FaMagic className="text-emerald-600" /> Impact & Metrics
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-emerald-950">
                      {report.improvementSuggestions.impactEnhancements.map((f, idx) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2">
                    <p className="font-bold text-blue-900 flex items-center gap-1.5">
                      <FaLightbulb className="text-blue-600" /> Content & Tone
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-blue-950">
                      {report.improvementSuggestions.contentAndTone.map((f, idx) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Direct Action Banner */}
            <div className="bg-black text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">Ready to test your optimized resume?</h3>
                <p className="text-xs text-gray-400">Launch a mock interview pre-configured with your target role and resume context.</p>
              </div>
              <button
                onClick={startInterviewFromResume}
                className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition flex items-center gap-2 text-xs shrink-0 cursor-pointer"
              >
                <FaPlay size={10} /> Practice Mock Interview Now
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ResumeOptimizer;
