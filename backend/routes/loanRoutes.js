import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { createLoan, listLoans, returnLoan } from "../controllers/loanController.js";

const router = express.Router();

router.get("/", authenticateToken, listLoans);
router.post("/", authenticateToken, createLoan);
router.post("/:id/return", authenticateToken, returnLoan);

export default router;

