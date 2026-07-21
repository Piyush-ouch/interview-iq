import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  completeBattleInterview,
  createBattle,
  getBattle,
  getMyBattles,
  joinBattle,
} from "../controllers/battle.controller.js";

const battleRouter = express.Router();

battleRouter.post("/create", isAuth, createBattle);
battleRouter.post("/join", isAuth, joinBattle);
battleRouter.post("/complete-interview", isAuth, completeBattleInterview);

battleRouter.get("/my-battles", isAuth, getMyBattles);
battleRouter.get("/:id", isAuth, getBattle);

export default battleRouter;
