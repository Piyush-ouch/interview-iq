import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getPersonalityProfiles,
  transformStyleResponse,
} from "../controllers/personalityStyle.controller.js";

const router = express.Router();

router.get("/profiles", isAuth, getPersonalityProfiles);
router.post("/transform-style", isAuth, transformStyleResponse);

export default router;
