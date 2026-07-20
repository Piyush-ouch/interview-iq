import QuestionBank from "../models/questionBank.model.js";
import { initialQuestionsData } from "../services/questionBankSeed.js";

/**
 * Search and filter persistent question bank
 */
export const searchQuestions = async (req, res) => {
  try {
    const { search, industry, role, difficulty, skill, category, page = 1, limit = 12 } = req.query;

    const query = {};

    if (industry && industry !== "All") {
      query.industry = industry;
    }

    if (role && role !== "All") {
      query.role = role;
    }

    if (difficulty && difficulty !== "All") {
      query.difficulty = difficulty;
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (skill) {
      query.skills = { $in: [new RegExp(skill.trim(), "i")] };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { question: searchRegex },
        { skills: searchRegex },
        { role: searchRegex },
        { industry: searchRegex },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [questions, total] = await Promise.all([
      QuestionBank.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limitNum),
      QuestionBank.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      questions,
    });
  } catch (error) {
    console.error("Error searching question bank:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to fetch questions: ${error.message}`,
    });
  }
};

/**
 * Get distinct metadata (industries, roles, difficulties, top skills) for UI filters
 */
export const getMetadata = async (req, res) => {
  try {
    const [industries, roles, difficulties, categories, rawSkills] = await Promise.all([
      QuestionBank.distinct("industry"),
      QuestionBank.distinct("role"),
      QuestionBank.distinct("difficulty"),
      QuestionBank.distinct("category"),
      QuestionBank.distinct("skills"),
    ]);

    // Format top skills list
    const topSkills = rawSkills.filter(Boolean).sort().slice(0, 30);

    return res.status(200).json({
      success: true,
      metadata: {
        industries: ["All", ...industries.sort()],
        roles: ["All", ...roles.sort()],
        difficulties: ["All", "Junior", "Mid", "Senior"],
        categories: ["All", ...categories.sort()],
        topSkills,
      },
    });
  } catch (error) {
    console.error("Error fetching question bank metadata:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to fetch metadata: ${error.message}`,
    });
  }
};

/**
 * Get pre-built question set grouped by difficulty for a specific role
 */
export const getByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const questions = await QuestionBank.find({
      role: new RegExp(`^${role.trim()}$`, "i"),
    });

    const grouped = {
      Junior: questions.filter((q) => q.difficulty === "Junior"),
      Mid: questions.filter((q) => q.difficulty === "Mid"),
      Senior: questions.filter((q) => q.difficulty === "Senior"),
    };

    return res.status(200).json({
      success: true,
      role,
      totalCount: questions.length,
      grouped,
      allQuestions: questions,
    });
  } catch (error) {
    console.error("Error fetching role questions:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to fetch role questions: ${error.message}`,
    });
  }
};

/**
 * Trigger Database Refresh / Re-seed
 */
export const refreshSeedData = async (req, res) => {
  try {
    await QuestionBank.deleteMany({});
    await QuestionBank.insertMany(initialQuestionsData);

    return res.status(200).json({
      success: true,
      message: "Question bank database refreshed successfully!",
      count: initialQuestionsData.length,
    });
  } catch (error) {
    console.error("Error refreshing question bank:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to refresh question bank: ${error.message}`,
    });
  }
};
