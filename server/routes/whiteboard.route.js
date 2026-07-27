import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  createOrGetRoom,
  getRoomState,
  saveRoomState,
} from "../controllers/whiteboard.controller.js";

const router = express.Router();

router.post("/room", isAuth, createOrGetRoom);
router.get("/room/:roomId", isAuth, getRoomState);
router.put("/room/:roomId", isAuth, saveRoomState);

export default router;
