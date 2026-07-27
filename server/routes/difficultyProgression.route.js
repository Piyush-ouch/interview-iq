import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getProgressionAnalytics,
  getSpacedRepetitionCards,
  submitCardReview,
  getAdaptiveNextQuestion,
} from "../controllers/difficultyProgression.controller.js";

const router = express.Router();

router.get("/analytics", isAuth, getProgressionAnalytics);
router.get("/spaced-repetition", isAuth, getSpacedRepetitionCards);
router.post("/spaced-repetition/review", isAuth, submitCardReview);
router.post("/adaptive-next-question", isAuth, getAdaptiveNextQuestion);

export default router;
