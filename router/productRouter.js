// productRoutes.js
import express from "express";
import {
  addImageUrl,
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  relatedProduct,
  resizeProductPhoto,
  updateProduct,
  uploadProductPhoto,
} from "../controller/productController.js";
import reviewRouter from "./reviewRoutes.js";
import { protect, restrictTo } from "../controller/authController.js";

const router = express.Router();

router.get("/relatedProduct/:category", relatedProduct, getAllProducts);
router
  .route("/")
  .post(
    protect,
    restrictTo("admin"),
    uploadProductPhoto,
    resizeProductPhoto,
    addImageUrl,
    createProduct
  )
  .get(getAllProducts);

router
  .route("/:id")
  .get(getProduct)
  .patch(protect, restrictTo("admin"), updateProduct)
  .delete(protect, restrictTo("admin"), deleteProduct);

router.use("/:productId/reviews", reviewRouter);

export default router;
