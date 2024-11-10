import express from "express";
import {
  createCart,
  getMyCarts,
  updateCart,
  deleteCart,
} from "../controller/cartController.js";
import { protect } from "../controller/authController.js";

const router = express.Router();
router.use(protect);

router.get("/", getMyCarts);

router.post("/:productId", createCart);

router.route("/:id").patch(updateCart).delete(deleteCart);

export default router;
