import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { getOverdueReports, getPopularBooks, setUserRole, getAllUsers } from "../controllers/adminController.js";

const router = express.Router();

router.get("/reports/overdue", authenticateToken, roleMiddleware(["admin", "librarian"]), getOverdueReports);
router.get("/reports/popular", authenticateToken, roleMiddleware(["admin", "librarian"]), getPopularBooks);
router.get("/users", authenticateToken, roleMiddleware(["admin", "librarian"]), getAllUsers);
router.post("/users/role", authenticateToken, roleMiddleware(["admin"]), setUserRole);

export default router;
