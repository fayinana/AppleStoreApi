import express from "express";
import * as userController from "./../controller/userController.js";
import { protect, restrictTo } from "../controller/authController.js";

const router = express.Router();

router.patch("/reactivateMe", userController.reactivateUser);
router.use(protect);

router.get("/me", userController.getMe, userController.getUser);
router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete("/deleteMe", userController.deleteMe);

router.use(restrictTo("admin"));

router.route("/").get(userController.getAllUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
