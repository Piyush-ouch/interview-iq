import { askAi } from "./openRouter.service.js";

/**
 * Analyzes resume text against optional job description using OpenRouter AI
 */
export const analyzeAndOptimizeResumeContent = async (resumeText, targetJobDescription = "", targetRole = "") => {
  const promptMessages = [
    {
      role: "system",
      content: `You are an expert ATS (Applicant Tracking System) Specialist and Senior Technical Recruiter.
Analyze the provided resume text thoroughly and compare it against the target job description/role if provided.

Return STRICTLY a JSON object matching this schema (do NOT include markdown code fences or any extra text outside JSON):

{
  "scores": {
    "overall": 82,
    "ats": 85,
    "impact": 78,
    "keywordMatch": 80,
    "readability": 88
  },
  "atsFormatting": {
    "atsFriendly": true,
    "formattingScore": 85,
    "warnings": [
      "Avoid multi-column tables or graphics that confuse ATS parsers.",
      "Ensure standard section titles like 'Work Experience', 'Education', and 'Skills' are used."
    ],
    "recommendations": [
      "Use clean bullet points starting with strong action verbs.",
      "Keep font size between 10pt and 12pt in clean fonts like Arial or Calibri."
    ]
  },
  "keywordOptimization": {
    "matchedKeywords": ["React", "JavaScript", "REST APIs", "Git"],
    "missingKeywords": ["TypeScript", "Docker", "Jest", "CI/CD Pipeline"],
    "keywordDensityScore": 78,
    "optimizationTips": [
      "Incorporate missing keywords in your project bullet points naturally.",
      "Add containerization tools (Docker/Kubernetes) to your skills section if applicable."
    ]
  },
  "improvementSuggestions": {
    "criticalFixes": [
      "Quantify your achievements with metrics (e.g., improved load time by 35%).",
      "Spell out acronyms on first use."
    ],
    "impactEnhancements": [
      "Replace weak verbs like 'worked on' with 'engineered', 'spearheaded', or 'architected'."
    ],
    "contentAndTone": [
      "Keep summary concise and focused on key tech stack impact."
    ]
  },
  "bulletPointRewrites": [
    {
      "original": "Worked on building user interfaces and fixing bugs.",
      "optimized": "Engineered high-performance React user interfaces, resolving 40+ critical bugs and improving page load times by 25%.",
      "reason": "Added strong action verb ('Engineered') and quantifiable impact metrics."
    },
    {
      "original": "Responsible for managing database queries.",
      "optimized": "Optimized complex SQL database queries and indexes, reducing query latency by 40% across high-traffic API endpoints.",
      "reason": "Eliminated passive phrasing ('Responsible for') and introduced technical specifics with latency metrics."
    }
  ]
}`,
    },
    {
      role: "user",
      content: `
Target Role: ${targetRole || "Software Engineer"}
Target Job Description:
${targetJobDescription || "Not provided - evaluate based on standard industry expectations for " + (targetRole || "Software Engineer")}

Candidate Resume Text:
${resumeText}
`,
    },
  ];

  const responseString = await askAi(promptMessages);

  // Clean JSON fence markers if present
  let cleanString = responseString.trim();
  if (cleanString.startsWith("```json")) {
    cleanString = cleanString.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleanString.startsWith("```")) {
    cleanString = cleanString.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(cleanString);
  } catch (parseError) {
    console.error("JSON parsing error in resume optimizer service:", parseError, cleanString);
    throw new Error("Failed to parse AI resume optimization response.");
  }
};
