import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getCareerAnalytics } from "../controllers/analytics.controller.js";

const analyticsRouter = express.Router();

analyticsRouter.get("/career-insights", isAuth, getCareerAnalytics);

export default analyticsRouter;
