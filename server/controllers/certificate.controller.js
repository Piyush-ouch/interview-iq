import crypto from "crypto";
import Certificate from "../models/certificate.model.js";
import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";

/**
 * Issues a verifiable certificate for an interview with finalScore >= 7.0
 */
export const issueCertificate = async (req, res) => {
  try {
    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({ message: "interviewId is required." });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found." });
    }

    // Verify ownership
    if (interview.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to interview record." });
    }

    // Check passing threshold (>= 7.0 out of 10)
    if ((interview.finalScore || 0) < 7.0) {
      return res.status(400).json({
        message: "Score does not meet certification threshold (Minimum 7.0 required).",
        qualifies: false,
        score: interview.finalScore || 0,
      });
    }

    // Return existing certificate if already issued
    const existingCert = await Certificate.findOne({ interviewId });
    if (existingCert) {
      return res.status(200).json({
        message: "Certificate already issued.",
        certificate: existingCert,
      });
    }

    const user = await User.findById(req.userId);
    const candidateName = user ? user.name : "Candidate";

    // Determine Badge Tier & Icon
    const finalScore = interview.finalScore || 0;
    let badgeTier = "Certified Professional";
    let badgeIcon = "📜";

    if (finalScore >= 9.0) {
      badgeTier = "Master";
      badgeIcon = "🏆";
    } else if (finalScore >= 8.0) {
      badgeTier = "Expert";
      badgeIcon = "⭐";
    }

    // Generate unique credential ID & SHA256 HMAC verification signature
    const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
    const credentialId = `CERT-IQ-${randomHex}`;

    const secretKey = process.env.JWT_SECRET || "interviewiq_credential_secret_2026";
    const verificationHash = crypto
      .createHmac("sha256", secretKey)
      .update(`${credentialId}:${interviewId}:${req.userId}:${finalScore}`)
      .digest("hex");

    // Compute verified skill tags based on role & performance
    const skillsVerified = [
      interview.role,
      `${interview.mode} Communication`,
      "Technical Problem Solving",
      finalScore >= 8.5 ? "High Confidence Articulation" : "Verbal Performance",
    ];

    // Calculate score breakdown averages
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;
    const totalQuestions = interview.questions.length || 1;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const certificate = await Certificate.create({
      credentialId,
      userId: user._id,
      interviewId: interview._id,
      candidateName,
      role: interview.role,
      mode: interview.mode,
      badgeTier,
      badgeIcon,
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number((totalConfidence / totalQuestions).toFixed(1)),
      communication: Number((totalCommunication / totalQuestions).toFixed(1)),
      correctness: Number((totalCorrectness / totalQuestions).toFixed(1)),
      verificationHash,
      skillsVerified,
    });

    return res.status(201).json({
      message: "Verifiable Credential issued successfully!",
      certificate,
    });
  } catch (error) {
    console.error("Error issuing certificate:", error);
    return res
      .status(500)
      .json({ message: `Failed to issue certificate: ${error.message}` });
  }
};

/**
 * Gets candidate's earned certificates
 */
export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ userId: req.userId }).sort({
      issueDate: -1,
    });
    return res.status(200).json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return res
      .status(500)
      .json({ message: `Failed to fetch certificates: ${error.message}` });
  }
};

/**
 * PUBLIC verification endpoint for recruiters & employers (no auth required)
 */
export const verifyCertificate = async (req, res) => {
  try {
    const { credentialId } = req.params;

    if (!credentialId) {
      return res.status(400).json({ message: "Credential ID required." });
    }

    const certificate = await Certificate.findOne({ credentialId });

    if (!certificate) {
      return res.status(404).json({
        isValid: false,
        message: "Credential ID not found or unverified.",
      });
    }

    return res.status(200).json({
      isValid: true,
      credential: {
        credentialId: certificate.credentialId,
        candidateName: certificate.candidateName,
        role: certificate.role,
        mode: certificate.mode,
        badgeTier: certificate.badgeTier,
        badgeIcon: certificate.badgeIcon,
        finalScore: certificate.finalScore,
        confidence: certificate.confidence,
        communication: certificate.communication,
        correctness: certificate.correctness,
        issueDate: certificate.issueDate,
        verificationHash: certificate.verificationHash,
        skillsVerified: certificate.skillsVerified,
        issuer: "InterviewIQ.AI Official Credentials System",
      },
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return res
      .status(500)
      .json({ message: `Failed to verify certificate: ${error.message}` });
  }
};
