import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import AppError from "./utils/appError.js";
import globalErrorHandler from "./controller/errorController.js";
import authRouter from "./router/authRouter.js";
import userRouter from "./router/userRouter.js";

dotenv.config({ path: ".env" });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
