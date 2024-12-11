import multer from "multer";
import Product from "../model/productModel.js";
import catchAsync from "../utils/catchAsync.js";
import { createOne, deleteOne, getAll, getOne } from "./handlerFactory.js";
import axios from "axios";
import dotenv from "dotenv";
import sharp from "sharp";
import AppError from "../utils/appError.js";

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

export const uploadProductPhoto = upload.single("coverImage");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_API_URL = process.env.GITHUB_API_URL.replace(
  "<GITHUB_REPO>",
  GITHUB_REPO
);

export const resizeProductPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `user-${req.user._id}-${Date.now()}.jpeg`;
  const buffer = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer();

  const response = await axios.put(
    `${GITHUB_API_URL}product/${filename}`,
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

export const addImageUrl = (req, res, next) => {
  const githubURL =
    "https://raw.githubusercontent.com/fayinana/HomeTradeNetwork-API-/refs/heads/main/file/image/product/";
  if (req.file) req.body.coverImage = `${githubURL}${req.file.filename}`;

  next();
};
export const createProduct = createOne(Product);
export const getAllProducts = getAll(Product);
export const getProduct = getOne(Product, { path: "reviews" });
export const deleteProduct = deleteOne(Product);

export const updateProduct = catchAsync(async (req, res, next) => {
  const {
    name,
    category,
    description,
    price,
    stock,
    coverImage,
    images,
    specifications,
    ratingsAverage,
    ratingsQuantity,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const isPriceModified = price && price !== product.price;

  if (name) product.name = name;
  if (category) product.category = category;
  if (description) product.description = description;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (coverImage) product.coverImage = coverImage;
  if (images) product.images = images;
  if (specifications) product.specifications = specifications;
  if (ratingsAverage) product.ratingsAverage = ratingsAverage;
  if (ratingsQuantity) product.ratingsQuantity = ratingsQuantity;

  await product.save();

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

export const relatedProduct = (req, res, next) => {
  req.query.category = req.params.category;
  req.query.limit = 4;

  next();
};
