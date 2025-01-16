import { getAll, getOne } from "./handlerFactory.js";
import Order from "./../model/orderModel.js";
import catchAsync from "../utils/catchAsync.js";

export const addMe = (req, res, next) => {
  req.query.user = req.user._id;
  return next();
};

export const getAllOrders = getAll(Order);
export const getOrder = getOne(Order, {
  path: "products.product",
  select: "price name coverImage category",
});

export const getRevenueByCategory = catchAsync(async (req, res, next) => {
  const pipeline = [
    {
      $unwind: "$products",
    },
    {
      $lookup: {
        from: "products",
        localField: "products.product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: "$productDetails",
    },
    {
      $group: {
        _id: "$productDetails.category",
        totalRevenue: {
          $sum: "$products.total",
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: "$_id",
        totalRevenue: 1,
      },
    },
    {
      $sort: { totalRevenue: -1 },
    },
  ];

  const revenueData = await Order.aggregate(pipeline);

  res.status(200).json({
    status: "success",
    revenueData,
  });
});

export const getMonthlyReport = catchAsync(async (req, res, next) => {
  const pipeline = [
    {
      $unwind: "$products",
    },
    {
      $addFields: {
        month: { $dateToString: { format: "%b", date: "$createdAt" } },
      },
    },
    {
      $group: {
        _id: "$month",
        totalSales: {
          $sum: { $multiply: ["$products.quantity", "$products.price"] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id",
        sales: "$totalSales",
      },
    },
    {
      $sort: { month: 1 },
    },
  ];

  const monthlyStat = await Order.aggregate(pipeline);
  res.status(200).json({
    status: "success",
    monthlyStat,
  });
});

export const updateOrderStatus = async (orderId, status) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    order.status = status;
    await order.save();
  } catch (error) {
    console.error(`Error updating order status: ${error.message}`);
  }
};
