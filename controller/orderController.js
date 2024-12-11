import { getAll, getOne } from "./handlerFactory.js";
import Order from "./../model/orderModel.js";
import catchAsync from "../utils/catchAsync.js";

export const addMe = catchAsync((req, res, next) => {
  req.query.user = req.user._id;
});
export const getAllOrders = getAll(Order);
export const getOrder = getOne(Order);
