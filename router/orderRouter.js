import express from "express";
import {
  addMe,
  getAllOrders,
  getOrder,
} from "../controller/orderController.js";
import { protect, restrictTo } from "./../controller/authController.js";
const router = express.Router();

router.use(protect);

router.route("/").get(restrictTo("admin"), getAllOrders);

router.get("/myOrders", addMe, getAllOrders);

router.get("/:id", getOrder);

export default router;
