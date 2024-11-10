import Product from "../model/productModel.js";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory.js";

export const createProduct = createOne(Product);
export const getAllProducts = getAll(Product);
export const getProduct = getOne(Product, { path: "reviews" });
export const deleteProduct = deleteOne(Product);
export const updateProduct = updateOne(Product);
