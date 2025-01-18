// Node built-in functions
import { promisify } from "util";
import crypto from "crypto";
// Third-party libraries
import jwt from "jsonwebtoken";
// Models
import User from "../model/userModel.js";
// Utilities
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import Email from "../utils/email.js";

// Helper Functions
function signJWT(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function createSendToken(statusCode, user, res) {
  const token = signJWT(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // sameSite: "None",
    // signed: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
}

// Controllers
export const signup = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, passwordConfirm, cart, order } =
    req.body;
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    passwordConfirm,
    cart,
    order,
  });
  const mail = new Email(user, "https://apple-store-front-end-one.vercel.app/");
  await mail.sendWelcome();
  createSendToken(201, user, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide both email and password.", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password.", 401));
  }
  createSendToken(200, user, res);
});

export const logout = catchAsync(async (req, res, next) => {
  res.clearCookie("jwt");
  res.status(200).json({
    status: "success",
    message: "Successfully logged out.",
  });
});

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError(
        "You are not logged in. Please log in to access this resource.",
        401
      )
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError("The user associated with this token no longer exists.", 401)
    );
  }

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("Password recently changed. Please log in again.", 401)
    );
  }

  req.user = freshUser;
  next();
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    next();
  };

export const forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError(
        "No account found with this email address. Please sign up or check your email.",
        404
      )
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const frontendURL = "https://apple-store-front-end-one.vercel.app/";

  const resetURL = `${frontendURL}/reset-password/${resetToken}`;

  // const message = `Forgot your password? Reset it using this link: ${resetURL}. If you did not request a password reset, please ignore this email.`;
  try {
    const mail = new Email(user, resetURL);
    await mail.resetPasswordLink();

    res.status(200).json({
      status: "success",
      message: "Password reset token sent to your email address.",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("Error sending email. Please try again later.", 500)
    );
  }
});
export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError(
        "Token is invalid or has expired. Please request a new password reset.",
        400
      )
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();
  createSendToken(200, user, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is incorrect.", 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(200, user, res);
});
