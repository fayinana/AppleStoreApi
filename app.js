import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
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
import orderRouter from "./router/orderRouter.js";
import checkoutRouter from "./router/checkoutRouter.js";
dotenv.config({ path: ".env" });

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5371", "http://10.240.163.26:5371"],
    credentials: true,
  })
);
app.options("*", cors());

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(mongoSanitize());

app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
      "category",
    ],
  })
);

app.use(compression());
app.use(cookieParser());

import Stripe from "stripe";
import bodyParser from "body-parser";
import { updateOrderStatus } from "./controller/orderController.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        // Update order status to 'paid'
        updateOrderStatus(paymentIntent.metadata.orderId, "paid");
        break;
      case "payment_intent.payment_failed":
        const paymentFailedIntent = event.data.object;
        // Update order status to 'failed'
        updateOrderStatus(paymentFailedIntent.metadata.orderId, "failed");
        break;
      // Add more event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  }
);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/carts", cartRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/create-checkout-session", checkoutRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
