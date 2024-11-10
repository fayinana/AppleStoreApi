import Cart from "../model/cartModel.js";
import User from "../model/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { updateOne } from "./handlerFactory.js";

export const createCart = catchAsync(async (req, res, next) => {
  const { quantity, price, product } = req.body;
  const productId = product || req.params.productId;

  const cart = await Cart.create({
    user: req.user._id,
    product: productId,
    quantity,
    price,
  });

  await User.findByIdAndUpdate(
    req.user._id,
    { $push: { cart: cart._id } },
    { new: true, runValidators: true }
  );

  res.status(201).json({
    status: "success",
    data: { cart },
  });
});

export const getMyCarts = catchAsync(async (req, res, next) => {
  const carts = await Cart.find({ user: req.user._id }).populate({
    path: "product",
    select: "name price imageUrl",
  });

  if (!carts || carts.length === 0) {
    return next(new AppError("No carts found for this user", 404));
  }

  res.status(200).json({
    status: "success",
    results: carts.length,
    data: { carts },
  });
});

export const updateCart = updateOne(Cart);

export const deleteCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findByIdAndDelete(req.params.id);

  if (!cart) {
    return next(new AppError("Cart item not found", 404));
  }

  await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { cart: req.params.id } },
    { new: true, runValidators: true }
  );

  res.status(204).json({
    status: "success",
    message: "Cart item deleted successfully",
  });
});
