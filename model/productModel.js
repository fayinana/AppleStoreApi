import mongoose from "mongoose";
import Cart from "./cartModel.js";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required."],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Product category is required."],
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required."],
      min: [0, "Price cannot be negative."],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative."],
    },
    coverImage: {
      type: String,
      required: [true, "Product cover image is required."],
      default: "https://example.com/default-image.jpg",
    },
    images: [{ type: String }],
    specifications: [
      {
        key: {
          type: String,
          required: [true, "Specification key is required."],
        },
        value: {
          type: String,
          required: [true, "Specification value is required."],
        },
      },
    ],
    ratingsAverage: {
      type: Number,
      default: 4,
      min: [0, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
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
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.pre("save", function (next) {
  if (this.isModified("price")) {
    this._isPriceModified = true;
  }
  next();
});

productSchema.post("save", async function (doc, next) {
  if (this._isPriceModified) {
    try {
      await Cart.updateMany(
        { product: doc._id },
        { $set: { price: doc.price } }
      );
    } catch (err) {
      console.error("Error updating cart prices:", err);
    }
  }
  next();
});
productSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});
const Product = mongoose.model("Product", productSchema);
export default Product;
