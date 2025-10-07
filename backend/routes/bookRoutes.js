import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { getAllBooks, borrowBook, returnBook, createBook, updateBookStatus } from "../controllers/bookController.js";

const router = express.Router();

router.get("/", authenticateToken, getAllBooks);
router.post("/:id/borrow", authenticateToken, borrowBook);
router.post("/:id/return", authenticateToken, returnBook);
router.post("/", authenticateToken, roleMiddleware(["admin", "librarian"]), createBook);
router.patch("/:id/status", authenticateToken, roleMiddleware(["admin", "librarian"]), updateBookStatus);

export default router;


