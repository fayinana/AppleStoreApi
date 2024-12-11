import Cart from "../model/cartModel.js";
import User from "../model/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { updateOne } from "./handlerFactory.js";

// Create a Cart
export const createCart = catchAsync(async (req, res, next) => {
  const { quantity, price, product } = req.body;
  const productId = product || req.params.productId;
  let cart = {};
  if (!quantity || !price || !productId) {
    return next(
      new AppError(
        "Please provide all required fields: product, quantity, and price",
        400
      )
    );
  }

  if (req.user.cart) {
    cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $push: { products: { product: productId, quantity, price } } },
      { new: true, runValidators: true }
    );
  } else {
    cart = await Cart.create({
      user: req.user._id,
      products: [{ product: productId, quantity, price }],
    });

    await User.findByIdAndUpdate(
      req.user._id,
      { cart: cart._id },
      { new: true, runValidators: true }
    );
  }
  res.status(201).json({
    status: "success",
    cart,
  });
});

export const getMyCarts = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({
    user: req.user.id,
  }).populate({
    path: "products.product",
    select: "name category price coverImage",
  });

  res.status(200).json({
    status: "success",
    results: cart?.products.length,
    cart,
  });
});

export const updateCart = updateOne(Cart);

export const deleteCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findByIdAndDelete(req.params.id);
  if (!cart) {
    return next(new AppError("Cart item not found", 404));
  }

  const user = await User.findByIdAndUpdate(
    cart.user,
    { cart: null },
    { new: true, runValidators: true }
  );
  res.status(204).json({
    status: "success",
    message: "Cart item deleted successfully",
  });
});
