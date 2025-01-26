import APIFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc)
      return next(
        new AppError("Invalid ID no document found with that Id", 404)
      );

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc)
      return next(
        new AppError("Invalid ID no document found with that Id", 404)
      );

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

export const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (req.query.active) query = query.findOne({ active: req.query.active });
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc)
      return next(
        new AppError("Invalid ID no document found with that Id", 404)
      );

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

export const getAll = (Model, defaultFilter = {}) =>
  catchAsync(async (req, res, next) => {
    const filter = { ...defaultFilter };
    const totalDoc = await Model.find();
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitField()
      .paginate();
    // .search();
    const doc = await features.query;
    res.status(200).json({
      status: "success",
      result: doc.length,
      data: doc,
      total: totalDoc.length,
    });
  });
