// productRoutes.js
import express from "express";
import {
  uploadProductImages,
  resizeProductImages,
  addImageUrl,
  createProduct,
  getAllProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  relatedProduct,
} from "../controller/productController.js";
import reviewRouter from "./reviewRoutes.js";
import { protect, restrictTo } from "../controller/authController.js";

const router = express.Router();

router.get("/relatedProduct/:category", relatedProduct, getAllProducts);
router.route("/").get(getAllProducts).post(
  protect,
  restrictTo("admin"),
  uploadProductImages,
  resizeProductImages, // Resize and upload to GitHub, updates req.body with filenames
  addImageUrl, // Add full GitHub image URLs to req.body
  createProduct // Create product with the updated req.body
);

router
  .route("/:id")
  .get(getProduct)
  .patch(
    protect,
    restrictTo("admin"),
    uploadProductImages, // Allow updates to images
    resizeProductImages, // Resize and upload to GitHub
    addImageUrl, // Add GitHub URLs
    updateProduct // Update product
  )
  .delete(protect, restrictTo("admin"), deleteProduct);

router.use("/:productId/reviews", reviewRouter);

export default router;
