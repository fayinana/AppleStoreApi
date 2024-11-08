import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import User from "./../model/userModel.js";
import { deleteOne, getAll, getOne, updateOne } from "./handlerFactory.js";

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const reactivateUser = catchAsync(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { email: req.body.email },
    { active: true },
    { new: true, runValidators: true }
  );
  if (!user) {
    return next(new AppError("User not found or already active.", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Account reactivated successfully.",
    data: {
      user,
    },
  });
});

export const getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user._id;
  req.query.active = true;
  next();
});

export const getAllUsers = getAll(User, { active: true });

export const createUser = catchAsync(async (req, res, next) => {
  res.status(201).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead.",
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return next(
      new AppError(
        "This is not the route to change password! Use updateMyPassword.",
        400
      )
    );
  }
  const filteredBody = filterObj(req.body, "firstName", "lastName", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: "success", data: null });
});

export const getUser = getOne(User);
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);
