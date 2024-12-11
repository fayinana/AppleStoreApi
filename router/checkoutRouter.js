import express from "express";
import { protect } from "../controller/authController.js";
import { createCheckoutSession } from "../controller/checkoutController.js";

const router = express.Router();

router.post("/", protect, createCheckoutSession);
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   stripeWebhook
// );
export default router;
