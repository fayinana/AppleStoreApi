// import Stripe from "stripe";
// import dotenv from "dotenv";
// import Cart from "./../model/cartModel.js";
// import Order from "../model/orderModel.js";
// import User from "../model/userModel.js";
// import catchAsync from "../utils/catchAsync.js";
// import AppError from "../utils/appError.js";

// dotenv.config({ path: ".env" });

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2024-10-28.acacia; custom_checkout_beta=v1;",
// });

// export const createCheckoutSession = catchAsync(async (req, res, next) => {
//   const user = await User.findById(req.user._id).populate({
//     path: "cart",
//     populate: { path: "products.product", select: "name price coverImage" },
//   });

//   if (!user || !user.cart || user.cart.products.length === 0) {
//     return next(new AppError("No items in cart", 400));
//   }

//   const cartItems = user.cart.products.map((item) => ({
//     product: item.product._id,
//     quantity: item.quantity,
//     price: item.product.price,
//     total: item.quantity * item.product.price,
//   }));

//   const totalPrice = cartItems.reduce((total, item) => total + item.total, 0);

//   const line_items = user.cart.products.map((item) => ({
//     price_data: {
//       currency: "usd",
//       product_data: {
//         name: item.product.name,
//         images: [item.product.coverImage],
//         metadata: { id: item.product.id },
//       },
//       unit_amount: Math.floor(item.product.price * 100),
//     },
//     quantity: item.quantity,
//   }));
//   const newOrder = await Order.create({
//     user: req.user._id,
//     products: cartItems,
//     totalPrice,
//     paymentStatus: "pending",
//     status: "processing",
//   });

//   const session = await stripe.checkout.sessions.create({
//     line_items: line_items,
//     mode: "payment",
//     success_url: `http://localhost:5371/checkoutSuccess/${newOrder._id}`,
//     cancel_url: "http://localhost:5371/cart",
//   });

//   newOrder.paymentIntentId = session.id;
//   await newOrder.save();

//   await Cart.findByIdAndDelete(user.cart.id);
//   user.cart = undefined;
//   user.order.push(newOrder._id);
//   await user.save({ validateBeforeSave: false });

//   res.status(200).json({
//     url: session.url,
//     message: "Order created and PaymentIntent initialized",
//   });
// });
import Stripe from "stripe";
import dotenv from "dotenv";
import Cart from "./../model/cartModel.js";
import Order from "../model/orderModel.js";
import User from "../model/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

dotenv.config({ path: ".env" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-10-28.acacia; custom_checkout_beta=v1;",
});

export const createCheckoutSession = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate({
    path: "cart",
    populate: { path: "products.product", select: "name price coverImage" },
  });

  if (!user || !user.cart || user.cart.products.length === 0) {
    return next(new AppError("No items in cart", 400));
  }

  const cartItems = user.cart.products.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.product.price,
    total: item.quantity * item.product.price,
  }));

  const totalPrice = cartItems.reduce((total, item) => total + item.total, 0);

  const line_items = user.cart.products.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.product.name,
        images: [item.product.coverImage],
        metadata: { id: item.product.id },
      },
      unit_amount: Math.floor(item.product.price * 100),
    },
    quantity: item.quantity,
  }));

  const newOrder = await Order.create({
    user: req.user._id,
    products: cartItems,
    totalPrice,
    paymentStatus: "pending",
    status: "processing",
    shippingStatus: "not_shipped", // Initialize shipping status
  });

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: "payment",
    success_url: `http://localhost:5371/checkoutSuccess/${newOrder._id}`,
    cancel_url: "http://localhost:5371/cart",
    customer_email: user.email,
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 500, currency: "usd" },
          display_name: "Standard Shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 5 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      },
    ],
  });

  newOrder.paymentIntentId = session.id;
  await newOrder.save();

  await Cart.findByIdAndDelete(user.cart.id);
  user.cart = undefined;
  user.order.push(newOrder._id);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    url: session.url,
    message: "Order created and PaymentIntent initialized",
  });
});

// export const stripeWebhook = catchAsync(async (req, res, next) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;
//     const order = await Order.findOne({ paymentIntentId: session.id });

//     if (order) {
//       order.paymentStatus = "paid";
//       order.status = "processing";
//       order.shippingStatus = "in_transit"; // Update shipping status
//       await order.save();
//     }
//   } else if (event.type === "checkout.session.expired") {
//     const session = event.data.object;
//     const order = await Order.findOne({ paymentIntentId: session.id });

//     if (order) {
//       order.paymentStatus = "failed";
//       order.status = "canceled";
//       await order.save();
//     }
//   }

//   res.status(200).send("Webhook received and processed.");
// });
