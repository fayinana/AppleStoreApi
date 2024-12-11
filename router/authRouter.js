import express from "express";
import {
  forgetPassword,
  login,
  logout,
  protect,
  resetPassword,
  signup,
  updatePassword,
} from "../controller/authController.js";

const router = express.Router();

router.post("/register", signup);
router.post("/login", login);
router.post("/forgotPassword", forgetPassword);
router.post("/resetPassword/:token", resetPassword);

router.use(protect);
router.post("/logout", logout);
router.patch("/changePassword", updatePassword);

export default router;
