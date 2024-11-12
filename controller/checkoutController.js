import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../model/orderModel.js";
import User from "../model/userModel.js";
import catchAsync from "../utils/catchAsync.js";

dotenv.config({ path: ".env" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "cart",
    populate: { path: "product", select: "name price imageUrl" },
  });

  if (!user || !user.cart || user.cart.length === 0) {
    return res.status(404).json({ message: "No items in cart" });
  }

  const amount = user.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Step 1: Create a PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Amount in cents
    currency: "usd",
    payment_method_types: ["card"],
    description: `Payment for Order by ${user.email}`,
    metadata: { userId: user._id.toString() },
  });

  // Step 2: Create an order in the database
  const order = new Order({
    user: req.user._id,
    products: user.cart.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    })),
    totalPrice: amount,
    paymentIntentId: paymentIntent.id,
    paymentStatus: "pending",
    status: "processing",
  });

  await order.save();
  user.cart = [];
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    clientSecret: paymentIntent.client_secret,
    message: "Order created and PaymentIntent initialized",
  });
});

// feat: Implemented order creation and Stripe payment integration

// - Created order processing logic in the backend.
// - Integrated Stripe for handling payment sessions.
// - Developed checkout session creation for initiating payments via Stripe.
// - Returned the clientSecret for payment confirmation on the frontend.
// - Added error handling for payment processing failures.
// - **Pending**: Add function to automatically update the payment status of the order after payment completion (to be implemented in future commits).
