import express from "express";
import {
  searchQuestions,
  getMetadata,
  getByRole,
  refreshSeedData,
} from "../controllers/questionBank.controller.js";

const questionBankRouter = express.Router();

questionBankRouter.get("/search", searchQuestions);
questionBankRouter.get("/metadata", getMetadata);
questionBankRouter.get("/role/:role", getByRole);
questionBankRouter.post("/refresh", refreshSeedData);

export default questionBankRouter;
