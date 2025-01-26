import multer from "multer";
import sharp from "sharp";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Product from "../model/productModel.js";
import { createOne, deleteOne, getAll, getOne } from "./handlerFactory.js";
import catchAsync from "../utils/catchAsync.js";

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

export const uploadProductImages = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
}).fields([
  { name: "coverImage", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

export const resizeProductImages = async (req, res, next) => {
  if (!req.files) return next();

  const githubRepo = "HomeTradeNetwork-API-";
  const githubBranch = "main";
  const githubPath = "file/image/product";
  const githubToken = process.env.GITHUB_TOKEN;

  const githubUrl = `https://api.github.com/repos/fayinana/${githubRepo}/contents/${githubPath}/`;

  const uploadToGitHub = async (buffer, filename) => {
    const imageBase64 = buffer.toString("base64");
    const githubUrl = `https://api.github.com/repos/fayinana/${githubRepo}/contents/${githubPath}/${filename}`;

    let sha = null;

    try {
      // Step 1: Check if the file exists to get its sha
      const response = await axios.get(githubUrl, {
        headers: { Authorization: `token ${githubToken}` },
      });
      sha = response.data.sha; // Get the existing file sha
    } catch (err) {
      if (err.response && err.response.status !== 404) {
        throw new Error(`Error checking file existence: ${err.message}`);
      }
      // If 404, it means the file doesn't exist, so we continue without sha
    }

    // Step 2: Upload (or overwrite) the file
    const uploadData = {
      message: `Upload ${filename}`,
      content: imageBase64,
      branch: githubBranch,
    };

    if (sha) {
      uploadData.sha = sha; // Include sha to overwrite the file
    }

    await axios.put(githubUrl, uploadData, {
      headers: { Authorization: `token ${githubToken}` },
    });
  };

  try {
    // 1) Cover Image
    if (req.files.coverImage) {
      const filename = `products-${Date.now()}-cover-${
        Math.random() * 100000000000
      }.jpeg`;
      await sharp(req.files.coverImage[0].buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toBuffer()
        .then(async (buffer) => uploadToGitHub(buffer, filename));

      req.body.coverImage = filename;
    }

    // 2) Additional Images
    if (req.files.images) {
      req.body.images = [];
      await Promise.all(
        req.files.images.map(async (file) => {
          const filename = `products-${uuidv4()}.jpeg`;
          await sharp(file.buffer)
            .resize(1000, 1000)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toBuffer()
            .then(async (buffer) => uploadToGitHub(buffer, filename));

          req.body.images.push(filename);
        })
      );
    }

    next();
  } catch (err) {
    console.error("Error uploading to GitHub:", err.message);
    res.status(500).json({ message: "Failed to upload images to GitHub" });
  }
};

// Add GitHub URLs to image filenames
export const addImageUrl = (req, res, next) => {
  const githubURL =
    "https://raw.githubusercontent.com/fayinana/HomeTradeNetwork-API-/main/file/image/product/";

  // Add coverImage URL
  if (req.body.coverImage) {
    req.body.coverImage = `${githubURL}${req.body.coverImage}`;
  }

  // Add images array URLs
  if (req.body.images && Array.isArray(req.body.images)) {
    req.body.images = req.body.images.map((image) => `${githubURL}${image}`);
  }

  next();
};

// Controller for creating a new product
export const createProduct = createOne(Product);
// catchAsync(async (req, res) => {
//   const product = await Product.create(req.body);
//   res.status(201).json({
//     status: "success",
//     data: product,
//   });
// });
export const getAllProducts = getAll(Product);
export const getProduct = getOne(Product, { path: "reviews" });
export const deleteProduct = deleteOne(Product);

export const updateProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  console.log(product);
  if (!product) throw new Error("No product found with that ID");

  res.status(200).json({
    status: "success",
    data: product,
  });
});

export const relatedProduct = (req, res, next) => {
  req.query.category = req.params.category;
  req.query.limit = 4;

  next();
};
