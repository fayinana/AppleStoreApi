import express from "express";
import { protect } from "../controller/authController.js";
import { createCheckoutSession } from "../controller/checkoutController.js";

const router = express.Router();

router.post("/", protect, createCheckoutSession);

export default router;
