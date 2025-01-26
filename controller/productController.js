import multer from "multer";
import sharp from "sharp";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Product from "../model/productModel.js";
import { createOne, deleteOne, getAll, getOne } from "./handlerFactory.js";
import catchAsync from "../utils/catchAsync.js";

dotenv.config();

// Multer Configuration
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

  const uploadToGitHub = async (buffer, filename) => {
    const imageBase64 = buffer.toString("base64");
    const githubUrl = `https://api.github.com/repos/fayinana/${githubRepo}/contents/${githubPath}/${filename}`;

    try {
      // Check if file exists and get SHA
      const existingFile = await axios.get(githubUrl, {
        headers: { Authorization: `token ${githubToken}` },
      });
      const sha = existingFile.data.sha;

      // Overwrite file if it exists
      await axios.put(
        githubUrl,
        {
          message: `Update ${filename}`,
          content: imageBase64,
          sha,
          branch: githubBranch,
        },
        {
          headers: { Authorization: `token ${githubToken}` },
        }
      );
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // File does not exist, create it
        await axios.put(
          githubUrl,
          {
            message: `Create ${filename}`,
            content: imageBase64,
            branch: githubBranch,
          },
          {
            headers: { Authorization: `token ${githubToken}` },
          }
        );
      } else {
        console.error(`GitHub Upload Error: ${err.message}`);
        throw err;
      }
    }
  };

  try {
    // Handle cover image
    if (req.files.coverImage) {
      const filename = `products-${Date.now()}-cover-${Math.random().toFixed(
        8
      )}.jpeg`;
      const buffer = await sharp(req.files.coverImage[0].buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toBuffer();

      await uploadToGitHub(buffer, filename);
      req.body.coverImage = filename;
    }

    // Handle additional images
    if (req.files.images) {
      req.body.images = [];
      for (const file of req.files.images) {
        const filename = `products-${uuidv4()}.jpeg`;
        const buffer = await sharp(file.buffer)
          .resize(1000, 1000)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toBuffer();

        await uploadToGitHub(buffer, filename);
        req.body.images.push(filename);
      }
    }

    next();
  } catch (err) {
    console.error("Error processing images:", err.message);
    res.status(500).json({ message: "Failed to process images." });
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
