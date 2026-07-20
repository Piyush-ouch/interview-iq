import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { analyzeAndOptimizeResumeContent } from "../services/resumeOptimizer.service.js";

/**
 * Controller to analyze uploaded PDF resume or raw text against target JD/Role
 */
export const analyzeAndOptimizeResume = async (req, res) => {
  let filepath = null;

  try {
    let resumeText = req.body.resumeText || "";
    const targetJobDescription = req.body.targetJobDescription || "";
    const targetRole = req.body.targetRole || "";

    // If PDF file was uploaded via Multer
    if (req.file) {
      filepath = req.file.path;
      const fileBuffer = await fs.promises.readFile(filepath);
      const uint8Array = new Uint8Array(fileBuffer);
      const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

      let extractedText = "";
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        extractedText += pageText + "\n";
      }

      resumeText = extractedText.replace(/\s+/g, " ").trim();
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid resume PDF file or resume text (at least 50 characters).",
      });
    }

    const optimizationReport = await analyzeAndOptimizeResumeContent(
      resumeText,
      targetJobDescription,
      targetRole
    );

    return res.status(200).json({
      success: true,
      resumeText,
      report: optimizationReport,
    });
  } catch (error) {
    console.error("Error in analyzeAndOptimizeResume controller:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to analyze resume: ${error.message}`,
    });
  } finally {
    // Guaranteed disk cleanup to prevent orphan files and security risks
    if (filepath && fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
      } catch (unlinkErr) {
        console.error("Error deleting uploaded temp resume file:", unlinkErr);
      }
    }
  }
};
