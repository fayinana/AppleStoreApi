import multer from "multer";
import sharp from "sharp";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import User from "./../model/userModel.js";
import { deleteOne, getAll, getOne, updateOne } from "./handlerFactory.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config(".env");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("not an image! please upload only image "), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

export const uploadUserPhoto = upload.single("image");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_API_URL = process.env.GITHUB_API_URL.replace(
  "<GITHUB_REPO>",
  GITHUB_REPO
);

export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `user-${req.user._id}-${Date.now()}.jpeg`;
  const buffer = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer();

  const response = await axios.put(
    `${GITHUB_API_URL}user/${filename}`,
    {
      message: `Upload image ${filename}`,
      content: buffer.toString("base64"),
    },
    {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (response.status !== 201) {
    return next(new AppError("Failed to upload image to GitHub", 500));
  }

  req.file.filename = filename;
  next();
});

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

export const getAllUsers = getAll(User);

export const createUser = catchAsync(async (req, res, next) => {
  res.status(201).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead.",
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
  // TODO:
  const githubURL =
    "https://raw.githubusercontent.com/fayinana/HomeTradeNetwork-API-/refs/heads/main/file/image/user/";
  if (req.body.password) {
    return next(
      new AppError(
        "This is not the route to change password! Use updateMyPassword.",
        400
      )
    );
  }
  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "email",
    "image"
  );
  if (req.file) filteredBody.image = `${githubURL}${req.file.filename}`;

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
