import Model from '../models/Model.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

// @desc    Check if model code is unique
// @route   GET /api/models/check-code/:code
// @access  Public
const checkModelCode = async (req, res) => {
  try {
    const { code } = req.params;
    const model = await Model.findOne({ code });
    res.status(200).json({ isUnique: !model });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all models
// @route   GET /api/models
// @access  Private (Admin, Factory)
const getModels = async (req, res) => {
  try {
    const models = await Model.find({}).populate('category', 'name');
    res.status(200).json(models);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get model by ID
// @route   GET /api/models/:id
// @access  Private (Admin, Factory)
const getModelById = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id).populate('category', 'name');
    if (model) {
      res.status(200).json(model);
    } else {
      res.status(404).json({ message: 'Model not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get models by category
// @route   GET /api/models/category/:categoryId
// @access  Private (Admin, Factory)
const getModelsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    const models = await Model.find({ category: categoryId }).populate('category', 'name');
    res.status(200).json(models);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new model
// @route   POST /api/models
// @access  Private (Admin, Factory)
const createModel = async (req, res) => {
  const { name, code, category, specifications, warranty, status } = req.body;

  if (!name || !code || !category || !specifications || !specifications.grossWeight || !specifications.kwHp || !specifications.voltage || !specifications.mrpPrice) {
    return res.status(400).json({ message: 'Please enter all required fields for model and specifications.' });
  }

  try {
    const modelExists = await Model.findOne({ code });
    if (modelExists) {
      return res.status(400).json({ message: 'Model with this code already exists' });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const latestModel = await Model.findOne().sort({ serialNumber: -1 });
    const serialNumber = latestModel ? latestModel.serialNumber + 1 : 1;

    const model = await Model.create({
      name,
      code,
      category,
      serialNumber,
      specifications,
      warranty,
      status
    });

    res.status(201).json(model);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a model
// @route   PUT /api/models/:id
// @access  Private (Admin, Factory)
const updateModel = async (req, res) => {
  const { name, code, category, specifications, warranty, status } = req.body;

  try {
    const model = await Model.findById(req.params.id);

    if (model) {
      if (code && code !== model.code) {
        const modelExists = await Model.findOne({ code });
        if (modelExists) {
          return res.status(400).json({ message: 'Model with this code already exists' });
        }
      }

      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ message: 'Category not found' });
      }

      model.name = name || model.name;
      model.code = code || model.code;
      model.category = category || model.category;
      model.specifications = {
        ...model.specifications,
        ...specifications,
      };
      model.warranty = warranty || model.warranty;
      model.status = status || model.status;

      const updatedModel = await model.save();
      res.status(200).json(updatedModel);
    } else {
      res.status(404).json({ message: 'Model not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update model status
// @route   PATCH /api/models/:id/status
// @access  Private (Admin, Factory)
const updateModelStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const model = await Model.findById(req.params.id);

    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    model.status = status;
    await model.save();
    res.status(200).json({ message: 'Model status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a model
// @route   DELETE /api/models/:id
// @access  Private (Admin, Factory)
const deleteModel = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);

    if (model) {
      await model.deleteOne();
      res.status(200).json({ message: 'Model removed' });
    } else {
      res.status(404).json({ message: 'Model not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete multiple models
// @route   DELETE /api/models
// @access  Private (Admin, Factory)
const deleteMultipleModels = async (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length === 0) {
    return res.status(400).json({ message: 'No model IDs provided' });
  }

  try {
    await Model.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: 'Models removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  checkModelCode,
  getModels,
  getModelById,
  getModelsByCategory,
  createModel,
  updateModel,
  updateModelStatus,
  deleteModel,
  deleteMultipleModels
};