import express from "express";
import {
  addMe,
  getAllOrders,
  getMonthlyReport,
  getOrder,
  getRevenueByCategory,
} from "../controller/orderController.js";
import { protect, restrictTo } from "./../controller/authController.js";
const router = express.Router();

router.use(protect);

router.route("/").get(restrictTo("admin"), getAllOrders);

router.get("/myOrders", addMe, getAllOrders);
router.get("/ordersStatus", restrictTo("admin"), getRevenueByCategory);
router.get("/monthlyStat", restrictTo("admin"), getMonthlyReport);

router.get("/:id", getOrder);

export default router;
