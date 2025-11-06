import express from "express";
import { verifyAccount } from "../controllers/verifyAccount.controller.js";

const router = express.Router();

router.post("/", verifyAccount);


export default router;