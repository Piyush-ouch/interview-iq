import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FaLinkedin,
  FaCheckCircle,
  FaShareAlt,
  FaCopy,
  FaDownload,
  FaShieldAlt,
  FaTrophy,
  FaStar,
  FaMedal,
} from "react-icons/fa";
import jsPDF from "jspdf";

export default function CertificateCard({ certificate }) {
  const [copied, setCopied] = useState(false);

  if (!certificate) return null;

  const {
    credentialId,
    candidateName,
    role,
    mode,
    badgeTier,
    badgeIcon,
    finalScore,
    confidence,
    communication,
    correctness,
    issueDate,
    skillsVerified = [],
  } = certificate;

  const formattedDate = new Date(issueDate || Date.now()).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const month = new Date(issueDate || Date.now()).getMonth() + 1;
  const year = new Date(issueDate || Date.now()).getFullYear();

  const publicVerificationUrl = `${window.location.origin}/verify-credential/${credentialId}`;

  // LinkedIn Certification Add URL Scheme
  const linkedinAddUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
    `${role} - ${badgeTier} Credential`
  )}&organizationName=${encodeURIComponent(
    "InterviewIQ.AI Platform"
  )}&issueMonth=${month}&issueYear=${year}&certUrl=${encodeURIComponent(
    publicVerificationUrl
  )}&certId=${encodeURIComponent(credentialId)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicVerificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Background Gradient Frame
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, width, height, "F");

    // Gold/Emerald Border
    doc.setLineWidth(3);
    doc.setDrawColor(16, 185, 129);
    doc.rect(10, 10, width - 20, height - 20);

    doc.setLineWidth(1);
    doc.setDrawColor(203, 213, 225);
    doc.rect(13, 13, width - 26, height - 26);

    // Title & Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(15, 23, 42);
    doc.text("VERIFIABLE SKILL CREDENTIAL", width / 2, 35, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text("INTERVIEW IQ • OFFICIAL AI CERTIFICATION", width / 2, 45, { align: "center" });

    // Candidate Name
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text("This is to certify that", width / 2, 65, { align: "center" });

    doc.setFontSize(28);
    doc.setTextColor(15, 23, 42);
    doc.text(candidateName.toUpperCase(), width / 2, 80, { align: "center" });

    // Achievement Role & Tier
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text(`has demonstrated benchmark interview mastery for the role of`, width / 2, 98, {
      align: "center",
    });

    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text(`${role} (${badgeTier} Tier)`, width / 2, 112, { align: "center" });

    // Scores Table Summary
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text(
      `Final Score: ${finalScore}/10  |  Confidence: ${confidence}/10  |  Communication: ${communication}/10  |  Correctness: ${correctness}/10`,
      width / 2,
      130,
      { align: "center" }
    );

    // Verification Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Credential ID: ${credentialId}`, 20, 175);
    doc.text(`Issue Date: ${formattedDate}`, 20, 182);
    doc.text(`Verify Online: ${publicVerificationUrl}`, width - 20, 175, { align: "right" });

    doc.save(`${candidateName}_InterviewIQ_${badgeTier}_Credential.pdf`);
  };

  // Badge Tier Theme colors
  const getTierTheme = () => {
    if (badgeTier === "Master") {
      return {
        bg: "from-amber-500 via-yellow-500 to-amber-600",
        border: "border-amber-300",
        text: "text-amber-700",
        badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
      };
    }
    if (badgeTier === "Expert") {
      return {
        bg: "from-emerald-500 via-teal-500 to-cyan-600",
        border: "border-emerald-300",
        text: "text-emerald-700",
        badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
      };
    }
    return {
      bg: "from-indigo-500 via-purple-500 to-indigo-600",
      border: "border-indigo-300",
      text: "text-indigo-700",
      badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-300",
    };
  };

  const theme = getTierTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col justify-between relative"
    >
      {/* Top Banner Header */}
      <div className={`bg-gradient-to-r ${theme.bg} p-6 text-white relative`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{badgeIcon}</span>
            <div>
              <span className="text-xs uppercase tracking-widest font-extrabold text-white/90">
                Official Verifiable Credential
              </span>
              <h3 className="text-xl font-extrabold leading-tight mt-0.5">{role}</h3>
            </div>
          </div>

          <span className="bg-white/20 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1.5 rounded-full border border-white/30 flex items-center gap-1">
            <FaShieldAlt /> {badgeTier}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-gray-400 block font-medium">Candidate</span>
            <span className="font-extrabold text-gray-800 text-base">{candidateName}</span>
          </div>

          <div>
            <span className="text-gray-400 block font-medium">Benchmark Score</span>
            <span className="font-extrabold text-emerald-600 text-base bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {finalScore}/10 Overall
            </span>
          </div>
        </div>

        {/* Skill Tags */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Verified Competencies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {skillsVerified.map((skill, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-md border border-gray-200 flex items-center gap-1"
              >
                <FaCheckCircle className="text-emerald-500 text-[10px]" /> {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 p-3 rounded-2xl border border-gray-100 text-xs">
          <div>
            <span className="text-gray-400 block font-medium text-[10px]">Confidence</span>
            <span className="font-extrabold text-gray-800">{confidence}/10</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium text-[10px]">Communication</span>
            <span className="font-extrabold text-gray-800">{communication}/10</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium text-[10px]">Correctness</span>
            <span className="font-extrabold text-gray-800">{correctness}/10</span>
          </div>
        </div>

        {/* Credential Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>
            ID: <strong className="text-gray-800">{credentialId}</strong>
          </span>
          <span>Issued: {formattedDate}</span>
        </div>
      </div>

      {/* Card Actions Footer: LinkedIn, Share Link, PDF */}
      <div className="bg-gray-50 p-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <a
          href={linkedinAddUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-[#0A66C2] hover:bg-[#084e96] text-white py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm"
        >
          <FaLinkedin size={16} /> Add to LinkedIn Profile
        </a>

        <button
          onClick={copyLink}
          className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <FaCopy size={13} /> {copied ? "Copied Link!" : "Copy Link"}
        </button>

        <button
          onClick={downloadPDF}
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
        >
          <FaDownload size={13} /> PDF Badge
        </button>
      </div>
    </motion.div>
  );
}
