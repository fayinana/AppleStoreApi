import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
// import xss from "xss-clean";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";

import AppError from "./utils/appError.js";
import globalErrorHandler from "./controller/errorController.js";
import authRouter from "./router/authRouter.js";
import userRouter from "./router/userRouter.js";
import productRouter from "./router/productRouter.js";
import reviewRouter from "./router/reviewRoutes.js";
import cartRouter from "./router/cartRouter.js";
import checkoutRouter from "./router/checkoutRouter.js";
dotenv.config({ path: ".env" });

const app = express();
app.use(express.json());
app.use(cors());
app.options("*", cors());

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(mongoSanitize());

// app.use(xss());

app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

app.use(compression());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/carts", cartRouter);
app.use("/api/v1/create-checkout-session", checkoutRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
