import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import { analyzeAndOptimizeResume } from "../controllers/resumeOptimizer.controller.js";

const resumeOptimizerRouter = express.Router();

resumeOptimizerRouter.post(
  "/analyze",
  isAuth,
  upload.single("resume"),
  analyzeAndOptimizeResume
);

export default resumeOptimizerRouter;
