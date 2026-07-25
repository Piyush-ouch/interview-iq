import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import Navbar from "../components/Navbar";
import CertificateCard from "../components/CertificateCard";
import { motion } from "motion/react";
import { FaAward, FaSearch, FaTrophy, FaMedal, FaShieldAlt } from "react-icons/fa";

export default function Certifications() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCertificates() {
      try {
        setLoading(true);
        const res = await axios.get(`${ServerUrl}/api/certificate/my-certificates`, {
          withCredentials: true,
        });
        setCertificates(res.data || []);
      } catch (err) {
        console.error("Failed to fetch user certificates:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificates();
  }, []);

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.credentialId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier =
      selectedTier === "All" || cert.badgeTier === selectedTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-500/20">
          <div className="space-y-2">
            <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5 w-fit">
              <FaShieldAlt /> Verifiable Credential Badges
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              My Skill Certificates & Badges
            </h1>
            <p className="text-gray-300 text-sm max-w-xl">
              Display your verified interview credentials on LinkedIn, resumes, and portfolio pages with digital authenticity proof.
            </p>
          </div>

          <button
            onClick={() => navigate("/interview")}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-nowrap"
          >
            <FaTrophy /> Take Interview to Earn Badges
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-3.5 top-3.5 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by role or credential ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Tier Filters */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {["All", "Master", "Expert", "Certified Professional"].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`text-xs px-3.5 py-2 rounded-xl font-bold transition text-nowrap border cursor-pointer ${
                  selectedTier === tier
                    ? "bg-black text-white border-black"
                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Grid List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 text-sm font-medium">Loading your verified credentials...</p>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              🏆
            </div>
            <h3 className="text-xl font-bold text-gray-800">No Certificates Earned Yet</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Complete an interview with a score of 7.0 or higher to earn an official Verifiable Skill Badge for your LinkedIn & resume.
            </p>
            <button
              onClick={() => navigate("/interview")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-md cursor-pointer"
            >
              Start Practice Interview
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((cert) => (
              <CertificateCard key={cert._id} certificate={cert} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
