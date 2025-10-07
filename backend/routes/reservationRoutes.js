import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { createReservation, listReservations } from "../controllers/reservationController.js";

const router = express.Router();

router.get("/", authenticateToken, listReservations);
router.post("/", authenticateToken, createReservation);

export default router;

