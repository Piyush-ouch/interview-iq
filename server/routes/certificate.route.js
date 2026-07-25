import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  issueCertificate,
  getMyCertificates,
  verifyCertificate,
} from "../controllers/certificate.controller.js";

const certificateRouter = express.Router();

certificateRouter.post("/issue", isAuth, issueCertificate);
certificateRouter.get("/my-certificates", isAuth, getMyCertificates);
certificateRouter.get("/verify/:credentialId", verifyCertificate);

export default certificateRouter;
