import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { motion } from "motion/react";
import {
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaLinkedin,
  FaCopy,
  FaArrowLeft,
  FaAward,
  FaLock,
} from "react-icons/fa";
import Navbar from "../components/Navbar";

export default function VerifyCredential() {
  const { credentialId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchVerification() {
      try {
        setLoading(true);
        const res = await axios.get(
          `${ServerUrl}/api/certificate/verify/${credentialId}`
        );
        setData(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Credential verification failed or ID invalid."
        );
      } finally {
        setLoading(false);
      }
    }

    if (credentialId) {
      fetchVerification();
    }
  }, [credentialId]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cred = data?.credential;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 sm:p-10 shadow-2xl space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <Link
              to="/"
              className="text-xs text-gray-300 hover:text-white flex items-center gap-1.5 transition"
            >
              <FaArrowLeft /> Back to Home
            </Link>

            <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-300 font-extrabold px-3 py-1.5 rounded-full border border-emerald-400/30">
              <FaLock /> Official Verification Portal
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-300 font-medium text-sm">
                Verifying digital signature on blockchain & database...
              </p>
            </div>
          ) : error || !data?.isValid ? (
            <div className="py-12 text-center space-y-4">
              <FaTimesCircle className="text-rose-500 text-5xl mx-auto animate-bounce" />
              <h2 className="text-2xl font-bold text-rose-300">
                Invalid or Unverified Credential
              </h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto">{error}</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Authenticity Banner */}
              <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-2xl p-5 text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-white shadow-lg mb-1">
                  <FaCheckCircle size={24} />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-300">
                  Authentic Verified Credential
                </h2>
                <p className="text-xs text-emerald-200/80 font-medium">
                  Verified by InterviewIQ.AI Public Verification Protocol
                </p>
              </div>

              {/* Credential Details */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">Candidate</span>
                    <h3 className="text-2xl font-extrabold text-white">{cred.candidateName}</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-400 block font-medium">Credential Tier</span>
                    <span className="text-sm font-extrabold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                      {cred.badgeIcon} {cred.badgeTier}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-400 block font-medium">Certified Skill Role</span>
                  <p className="text-xl font-bold text-emerald-400">{cred.role}</p>
                </div>

                {/* Score Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <span className="text-2xl font-extrabold text-emerald-400">
                      {cred.finalScore}/10
                    </span>
                    <span className="text-[10px] text-gray-400 block font-medium">
                      Overall Score
                    </span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <span className="text-xl font-bold text-white">{cred.confidence}/10</span>
                    <span className="text-[10px] text-gray-400 block font-medium">
                      Confidence
                    </span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <span className="text-xl font-bold text-white">{cred.communication}/10</span>
                    <span className="text-[10px] text-gray-400 block font-medium">
                      Communication
                    </span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <span className="text-xl font-bold text-white">{cred.correctness}/10</span>
                    <span className="text-[10px] text-gray-400 block font-medium">
                      Correctness
                    </span>
                  </div>
                </div>

                {/* Skills Tags */}
                <div>
                  <span className="text-xs text-gray-400 block font-medium mb-2">
                    Verified Competencies
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {cred.skillsVerified?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-emerald-500/10 text-emerald-300 font-semibold px-3 py-1 rounded-lg border border-emerald-500/20"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Digital HMAC Signature */}
                <div className="bg-black/30 p-4 rounded-xl border border-white/10 text-xs space-y-1.5">
                  <div className="flex justify-between text-gray-400">
                    <span>Credential ID:</span>
                    <strong className="text-white">{cred.credentialId}</strong>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Issue Date:</span>
                    <strong className="text-white">
                      {new Date(cred.issueDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </strong>
                  </div>
                  <div className="text-[10px] text-gray-500 truncate pt-1 border-t border-white/10">
                    Digital Hash: {cred.verificationHash}
                  </div>
                </div>
              </div>

              {/* Public Share Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={copyLink}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-white/20 transition cursor-pointer"
                >
                  <FaCopy /> {copied ? "Copied Link!" : "Copy Verification URL"}
                </button>

                <a
                  href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
                    `${cred.role} - ${cred.badgeTier}`
                  )}&organizationName=InterviewIQ.AI&certUrl=${encodeURIComponent(
                    window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#0A66C2] hover:bg-[#084e96] text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
                >
                  <FaLinkedin size={18} /> Add to LinkedIn
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
