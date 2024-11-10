import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Cart must belong to a user"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Cart item must reference a product"],
    },
    quantity: {
      type: Number,
      required: [true, "Cart item must have a quantity"],
      default: 1,
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: [true, "Cart item must have a price"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

cartSchema.virtual("totalPrice").get(function () {
  return this.price * this.quantity;
});

cartSchema.pre(/^find/, function (next) {
  this.populate({
    path: "product",
    select: "name price imageUrl",
  });
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
