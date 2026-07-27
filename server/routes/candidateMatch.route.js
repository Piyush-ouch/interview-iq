import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getMyMatchingProfile,
  updateMatchingProfile,
  getCandidateMatches,
  getPartnershipGroups,
  getLeaderboard,
  sendPartnershipRequest,
} from "../controllers/candidateMatch.controller.js";

const router = express.Router();

router.get("/profile", isAuth, getMyMatchingProfile);
router.put("/profile", isAuth, updateMatchingProfile);
router.get("/candidates", isAuth, getCandidateMatches);
router.get("/groups", isAuth, getPartnershipGroups);
router.get("/leaderboard", isAuth, getLeaderboard);
router.post("/request", isAuth, sendPartnershipRequest);

export default router;
