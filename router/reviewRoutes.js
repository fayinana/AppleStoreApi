// reviewRoutes.js
import { Router } from "express";
import {
  getAllReviews,
  setProductUserIds,
  createReview,
  deleteReview,
  updateReview,
  getReview,
} from "../controller/reviewController.js";
import { protect, restrictTo } from "../controller/authController.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(getAllReviews)
  .post(protect, restrictTo("user", "admin"), setProductUserIds, createReview);

router
  .route("/:id")
  .get(getReview)
  .patch(protect, restrictTo("user", "admin"), updateReview)
  .delete(protect, restrictTo("user", "admin"), deleteReview);

export default router;
