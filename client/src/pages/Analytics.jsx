import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { ServerUrl } from "../App";
import Navbar from "../components/Navbar";
import {
  FaChartLine,
  FaArrowLeft,
  FaTrophy,
  FaUserGraduate,
  FaBullseye,
  FaBookOpen,
  FaRocket,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMicrophone,
  FaShieldAlt,
  FaBrain,
  FaUsers,
  FaBuilding,
} from "react-icons/fa";

function Analytics() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${ServerUrl}/api/analytics/career-insights`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError(err.response?.data?.message || "Failed to load progress analytics.");
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [userData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-white transition-colors duration-300 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 text-center text-gray-500 dark:text-gray-400">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/2 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="h-32 bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
              <div className="h-32 bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
              <div className="h-32 bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!data || !data.hasData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-white transition-colors duration-300 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 text-center">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto transition-colors">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaChartLine size={28} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">No Interview Analytics Yet</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
              Complete your first AI mock interview to unlock candidate comparative analytics, industry benchmarking, skill gap analysis, and career trajectory predictions!
            </p>
            <button
              onClick={() => navigate("/interview")}
              className="bg-black dark:bg-emerald-600 hover:bg-gray-800 dark:hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition shadow-md cursor-pointer"
            >
              Start Your First Interview
            </button>
          </div>
        </main>
      </div>
    );
  }

  const { summary, comparativeAnalytics, industryBenchmarks, skillGapAnalysis, careerTrajectory } = data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-white transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer"
                title="Go Back"
              >
                <FaArrowLeft size={14} />
              </button>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <FaChartLine className="text-blue-600" />
                Progress Analytics & Career Insights
              </h1>
            </div>
            <p className="text-gray-500 text-sm mt-1 ml-11">
              Benchmarked against peers in <strong>{summary.primaryRole}</strong> & industry standards.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-3 self-start md:self-auto">
            <FaTrophy className="text-yellow-300 text-xl" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-blue-100 font-bold">Candidate Rank</p>
              <p className="text-sm font-extrabold">Top {100 - comparativeAnalytics.percentile}% Candidate</p>
            </div>
          </div>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500">Overall Score</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FaBullseye />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{summary.avgScore} <span className="text-sm text-gray-400 font-normal">/ 10</span></p>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <FaCheckCircle size={10} /> +0.6 vs Peer Avg ({comparativeAnalytics.rolePeerAverage})
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500">Peer Percentile</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <FaUsers />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-purple-700">{comparativeAnalytics.percentile}th</p>
            <p className="text-xs text-gray-500 mt-1">Outperforming {comparativeAnalytics.percentile}% of candidate pool</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500">Promotion Readiness</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <FaRocket />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-emerald-600">{careerTrajectory.readinessScore}%</p>
            <p className="text-xs text-gray-500 mt-1">Target: {careerTrajectory.targetCareerLevel}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500">Completed Mock Tests</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <FaUserGraduate />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{summary.totalInterviews}</p>
            <p className="text-xs text-gray-500 mt-1">Consistent preparation streak</p>
          </div>
        </div>

        {/* SECTION 1: Comparative Candidate Analytics */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaUsers className="text-blue-600" /> Candidate Comparative Benchmarks
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Comparing your average scores against candidates interviewing for <strong>{summary.primaryRole}</strong>.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              Role: {summary.primaryRole}
            </span>
          </div>

          <div className="space-y-5">
            {/* Overall Comparison */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Overall Performance Score</span>
                <span>Your Score: {summary.avgScore} / 10</span>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-blue-600 h-full text-[9px] text-white font-bold text-center flex items-center justify-center transition-all duration-500"
                    style={{ width: `${(summary.avgScore / 10) * 100}%` }}
                  >
                    You ({summary.avgScore})
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                  <span>Candidate Average: <strong>{comparativeAnalytics.rolePeerAverage}</strong></span>
                  <span>Top 10% Benchmark: <strong>{comparativeAnalytics.top10PercentScore}</strong></span>
                </div>
              </div>
            </div>

            {/* Metric Vectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800 mb-1">
                  <FaBrain className="text-blue-500" /> Technical Correctness
                </div>
                <p className="text-xl font-extrabold text-gray-900">{summary.avgCorr} / 10</p>
                <p className="text-[11px] text-gray-500 mt-1">Peer Avg: 7.6 | Top 10%: 9.3</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800 mb-1">
                  <FaMicrophone className="text-emerald-500" /> Communication Clarity
                </div>
                <p className="text-xl font-extrabold text-gray-900">{summary.avgComm} / 10</p>
                <p className="text-[11px] text-gray-500 mt-1">Peer Avg: 7.2 | Top 10%: 8.9</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800 mb-1">
                  <FaShieldAlt className="text-purple-500" /> Delivery & Confidence
                </div>
                <p className="text-xl font-extrabold text-gray-900">{summary.avgConf} / 10</p>
                <p className="text-[11px] text-gray-500 mt-1">Peer Avg: 7.1 | Top 10%: 8.8</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Industry Benchmarking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <FaBuilding className="text-indigo-600" /> Industry Benchmarking
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              How your skills align against official market standards for {industryBenchmarks.industryName}.
            </p>

            <div className="space-y-4 text-xs">
              {[
                { label: "Technical Knowledge", user: summary.avgCorr, target: industryBenchmarks.industryAverage.technical },
                { label: "Communication Clarity", user: summary.avgComm, target: industryBenchmarks.industryAverage.communication },
                { label: "Delivery & Confidence", user: summary.avgConf, target: industryBenchmarks.industryAverage.confidence },
                { label: "Overall Interview Score", user: summary.avgScore, target: industryBenchmarks.industryAverage.overall },
              ].map((m) => (
                <div key={m.label} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span>{m.label}</span>
                    <span className={m.user >= m.target ? "text-emerald-600" : "text-amber-600"}>
                      {m.user} vs Industry Avg ({m.target})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${m.user >= m.target ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: `${(m.user / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Career Trajectory Predictions */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <FaRocket className="text-emerald-600" /> Predictive Career Trajectory
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Statistical forecast of promotion readiness based on performance trajectory.
              </p>

              <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-5 rounded-2xl mb-6 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-emerald-200">Target Level Target</span>
                  <span className="text-xs font-bold bg-emerald-500/30 px-3 py-1 rounded-full border border-emerald-400/30">
                    {careerTrajectory.readinessScore}% Ready
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white mb-1">{careerTrajectory.targetCareerLevel}</h3>
                <p className="text-xs text-emerald-100">
                  Estimated Timeline: <strong>{careerTrajectory.estimatedTimeToPromotion}</strong>
                </p>

                <div className="w-full bg-emerald-950/60 h-2.5 rounded-full overflow-hidden mt-4">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${careerTrajectory.readinessScore}%` }}
                  ></div>
                </div>
              </div>

              <h4 className="text-xs font-bold text-gray-700 mb-3">Promotion Milestones Checklist:</h4>
              <div className="space-y-2 text-xs">
                {careerTrajectory.trajectoryMilestones.map((m) => (
                  <div key={m.step} className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                    <FaCheckCircle className={m.completed ? "text-emerald-600 mt-0.5" : "text-gray-300 mt-0.5"} />
                    <div>
                      <span className="font-bold text-gray-800">{m.title}</span>
                      <p className="text-[11px] text-gray-500">{m.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Skill Gap Analysis & Recommended Courses */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <FaBookOpen className="text-amber-500" /> Skill Gap Analysis & Recommended Courses
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            Actionable learning paths and high-rated resources targeting your identified skill gaps.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {skillGapAnalysis.skillGaps.map((gap, idx) => (
              <div key={idx} className="p-5 bg-amber-50/50 border border-amber-200/60 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                    <FaExclamationTriangle className="text-amber-600" /> {gap.skill}
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Score: {gap.score} / 10
                  </span>
                </div>

                <p className="text-xs text-amber-950">Recommended Courses & Guides:</p>
                <div className="space-y-2">
                  {gap.resources.map((res, rIdx) => (
                    <a
                      key={rIdx}
                      href={res.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white rounded-xl border border-amber-200/80 flex items-center justify-between text-xs font-semibold text-gray-800 hover:border-black transition group"
                    >
                      <div>
                        <span className="text-gray-900 group-hover:text-black">{res.title}</span>
                        <p className="text-[10px] text-gray-400 font-medium">Platform: {res.platform} &bull; {res.type}</p>
                      </div>
                      <FaExternalLinkAlt size={11} className="text-gray-400 group-hover:text-black transition" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 4-Week Actionable Roadmap */}
          <div className="bg-gray-900 text-white p-6 rounded-2xl">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <FaBullseye className="text-amber-400" /> Actionable 4-Week Improvement Roadmap
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {skillGapAnalysis.recommendedRoadmap.map((stepText, idx) => (
                <div key={idx} className="p-3 bg-gray-800/80 border border-gray-700 rounded-xl">
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block mb-1">
                    Phase 0{idx + 1}
                  </span>
                  <p className="text-gray-200 leading-relaxed">{stepText}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Analytics;
