import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    products: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: [true, "Each product must be referenced"],
        },
        quantity: {
          type: Number,
          required: [true, "Product must have a quantity"],
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: [true, "Each product must have a price"],
        },
        total: {
          type: Number,
          required: [true, "Total for each product is required"],
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
    },
    paymentIntentId: {
      type: String,
      required: [true, "Payment intent ID from Stripe is required"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["processing", "shipped", "delivered", "canceled"],
      default: "processing",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

orderSchema.virtual("orderTotal").get(function () {
  return this.products.reduce((total, product) => total + product.total, 0);
});

orderSchema.pre("save", function (next) {
  this.products.forEach((product) => {
    product.total = product.price * product.quantity;
  });
  this.totalPrice = this.orderTotal;
  next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
