import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import Navbar from "../components/Navbar";
import {
  FaSearch,
  FaArrowLeft,
  FaBookOpen,
  FaCode,
  FaLayerGroup,
  FaChevronDown,
  FaChevronUp,
  FaPlay,
  FaTags,
  FaLightbulb,
  FaSync,
  FaGraduationCap,
} from "react-icons/fa";

function QuestionBank() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState({
    industries: ["All"],
    roles: ["All"],
    difficulties: ["All", "Junior", "Mid", "Senior"],
    topSkills: [],
  });

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Accordion state for expanded answers
  const [expandedId, setExpandedId] = useState(null);

  // Fetch metadata once on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get(`${ServerUrl}/api/question-bank/metadata`);
        if (response.data.success) {
          setMetadata(response.data.metadata);
        }
      } catch (err) {
        console.error("Failed to fetch question bank metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch questions whenever filters change
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 9,
        search: searchTerm,
        industry: selectedIndustry,
        role: selectedRole,
        difficulty: selectedDifficulty,
        skill: selectedSkill,
      };

      const response = await axios.get(`${ServerUrl}/api/question-bank/search`, { params });
      if (response.data.success) {
        setQuestions(response.data.questions || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalQuestions(response.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, selectedIndustry, selectedRole, selectedDifficulty, selectedSkill]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedIndustry("All");
    setSelectedRole("All");
    setSelectedDifficulty("All");
    setSelectedSkill("");
    setPage(1);
  };

  const startInterviewWithRole = (questionItem) => {
    navigate("/interview", {
      state: {
        role: questionItem.role,
        experience:
          questionItem.difficulty === "Junior"
            ? "Beginner (0-1 yrs)"
            : questionItem.difficulty === "Senior"
            ? "Senior (3-5+ yrs)"
            : "Intermediate (1-3 yrs)",
        mode: "Technical",
      },
    });
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case "Junior":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Senior":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Mid":
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Header Section */}
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
                <FaBookOpen className="text-blue-600" />
                Industry Question Banks
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Explore pre-built persistent question sets for 50+ roles across Junior, Mid, and Senior levels.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="relative flex items-center">
            <FaSearch className="absolute left-4 text-gray-400 size-4" />
            <input
              type="text"
              placeholder="Search by technology (e.g. React, Python, SQL, System Design, Kubernetes)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-28 py-3.5 rounded-2xl border border-gray-200 bg-white shadow-xs focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 bg-black text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-gray-800 transition cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filters Grid */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Industry Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <FaLayerGroup className="text-gray-400" /> Industry
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => {
                  setSelectedIndustry(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white transition"
              >
                {metadata.industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <FaCode className="text-gray-400" /> Job Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white transition"
              >
                {metadata.roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <FaGraduationCap className="text-gray-400" /> Difficulty Level
              </label>
              <div className="flex bg-gray-100 p-0.5 rounded-xl">
                {["All", "Junior", "Mid", "Senior"].map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => {
                      setSelectedDifficulty(d);
                      setPage(1);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                      selectedDifficulty === d
                        ? "bg-white text-black shadow-xs"
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2 px-3 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <FaSync size={11} /> Reset All Filters
              </button>
            </div>
          </div>

          {/* Popular Skill Tags */}
          {metadata.topSkills.length > 0 && (
            <div className="pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <FaTags size={10} /> Popular Skills:
              </span>
              {metadata.topSkills.slice(0, 10).map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => {
                    setSelectedSkill(selectedSkill === skill ? "" : skill);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${
                    selectedSkill === skill
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-gray-500">
            Showing {questions.length} of {totalQuestions} persistent questions
          </p>
        </div>

        {/* Questions Grid */}
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
            Loading industry question bank...
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
            <p className="text-gray-500 text-sm mb-4">No questions found matching your filter criteria.</p>
            <button
              onClick={handleResetFilters}
              className="bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {questions.map((q) => {
              const isExpanded = expandedId === q._id;
              return (
                <div
                  key={q._id}
                  className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {q.industry}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(
                          q.difficulty
                        )}`}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 mb-1">{q.title}</h3>
                    <p className="text-xs font-semibold text-blue-600 mb-3">{q.role}</p>

                    <p className="text-xs text-gray-700 font-medium leading-relaxed mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      "{q.question}"
                    </p>

                    {/* Skill Tags */}
                    {q.skills && q.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {q.skills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium"
                          >
                            #{s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expandable Reference Answer */}
                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : q._id)}
                      className="w-full py-1.5 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 text-amber-600">
                        <FaLightbulb size={12} /> Reference Answer
                      </span>
                      {isExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                    </button>

                    {isExpanded && (
                      <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs space-y-2">
                        <p className="text-gray-800 leading-relaxed font-normal">{q.suggestedAnswer}</p>

                        {q.keyPoints && q.keyPoints.length > 0 && (
                          <div className="pt-2 border-t border-amber-200/60">
                            <p className="font-bold text-amber-900 mb-1 text-[11px]">Key Talking Points:</p>
                            <ul className="list-disc list-inside space-y-0.5 text-amber-950">
                              {q.keyPoints.map((pt, idx) => (
                                <li key={idx}>{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => startInterviewWithRole(q)}
                      className="w-full bg-black hover:bg-gray-800 text-white text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <FaPlay size={10} /> Practice {q.role} Mock Interview
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold bg-white text-gray-700 disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs font-semibold text-gray-600 px-3">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold bg-white text-gray-700 disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default QuestionBank;
