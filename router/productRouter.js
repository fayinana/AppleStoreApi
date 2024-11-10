// productRoutes.js
import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "../controller/productController.js";
import reviewRouter from "./reviewRoutes.js";
import { protect, restrictTo } from "../controller/authController.js";

const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo("admin"), createProduct)
  .get(getAllProducts);

router
  .route("/:id")
  .get(getProduct)
  .patch(protect, restrictTo("admin"), updateProduct)
  .delete(protect, restrictTo("admin"), deleteProduct);

router.use("/:productId/reviews", reviewRouter);

export default router;
