import Product from "../model/productModel.js";
import catchAsync from "../utils/catchAsync.js";
import { createOne, deleteOne, getAll, getOne } from "./handlerFactory.js";

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
