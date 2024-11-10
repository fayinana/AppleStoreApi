import { Schema, model } from "mongoose";
import Product from "./productModel.js";

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, "A review must have text."],
      trim: true,
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1."],
      max: [5, "Rating must be at most 5."],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    product: {
      type: Schema.ObjectId,
      ref: "Product",
      required: [true, "A review must belong to a product."],
    },
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: [true, "A review must belong to a user."],
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate([
    {
      path: "user",
      select: "name photo",
    },
  ]);
  next();
});

reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        nRating: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.product);
});

const Review = model("Review", reviewSchema);
export default Review;
