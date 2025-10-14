import Model from '../models/Model.js';
import asyncHandler from 'express-async-handler';

export const getModels = asyncHandler(async (req, res) => {
  const models = await Model.find({}).populate('category', 'name');
  res.json(models);
});

export const getModelById = asyncHandler(async (req, res) => {
  const model = await Model.findById(req.params.id).populate('category', 'name');
  if (model) {
    res.json(model);
  } else {
    res.status(404).json({ message: 'Model not found' });
  }
});

export const getModelsByCategory = asyncHandler(async (req, res) => {
  const models = await Model.find({ category: req.params.categoryId }).populate('category', 'name');
  res.json(models);
});

export const createModel = asyncHandler(async (req, res) => {
  const { name, code, category, specifications } = req.body;

  // Check if code already exists
  const existingModel = await Model.findOne({ code });
  if (existingModel) {
    res.status(400).json({ message: 'Code already assigned. Please choose a different code.' });
    return;
  }

  // Get the count of existing models to generate serial number
  const modelCount = await Model.countDocuments();
  const serialNumber = modelCount + 1;

  const model = await Model.create({
    name,
    code,
    category,
    serialNumber,
    specifications
  });

  if (model) {
    const populatedModel = await Model.findById(model._id).populate('category', 'name');
    res.status(201).json(populatedModel);
  } else {
    res.status(400).json({ message: 'Invalid model data' });
  }
});

export const updateModel = asyncHandler(async (req, res) => {
  const model = await Model.findById(req.params.id);

  if (model) {
    // Check if code is being updated and if it already exists
    if (req.body.code && req.body.code !== model.code) {
      const existingModel = await Model.findOne({ code: req.body.code });
      if (existingModel) {
        res.status(400).json({ message: 'Code already assigned. Please choose a different code.' });
        return;
      }
    }

    model.name = req.body.name || model.name;
    model.code = req.body.code || model.code;
    model.category = req.body.category || model.category;
    model.specifications = req.body.specifications || model.specifications;
    model.status = req.body.status || model.status;

    const updatedModel = await model.save();
    const populatedModel = await Model.findById(updatedModel._id).populate('category', 'name');
    res.json(populatedModel);
  } else {
    res.status(404).json({ message: 'Model not found' });
  }
});

export const deleteModel = asyncHandler(async (req, res) => {
  const model = await Model.findById(req.params.id);

  if (model) {
    await Model.deleteOne({ _id: model._id });
    res.json({ message: 'Model removed' });
  } else {
    res.status(404).json({ message: 'Model not found' });
  }
});

export const updateModelStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const model = await Model.findById(req.params.id).populate('category', 'name');

  if (model) {
    model.status = status;
    const updatedModel = await model.save();
    const populatedModel = await Model.findById(updatedModel._id).populate('category', 'name');
    res.json(populatedModel);
  } else {
    res.status(404).json({ message: 'Model not found' });
  }
});