import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import helmet from "helmet";
import bookRoutes from "./routes/bookRoutes.js";
import userRoutes from "./routes/authRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { httpLogger } from "./utils/logger.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));
app.use(httpLogger);

app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reservations", reservationRoutes);


app.use(errorMiddleware);

export default app;
