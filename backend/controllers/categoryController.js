import Category from '../models/Category.js';
import Model from '../models/Model.js'; // Import Model
import asyncHandler from 'express-async-handler';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});

  const categoriesWithModelCount = await Promise.all(categories.map(async (category) => {
    const modelCount = await Model.countDocuments({ category: category._id });
    return { ...category.toObject(), modelCount };
  }));

  res.json(categoriesWithModelCount);
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    res.json(category);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, status } = req.body;
  
  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400).json({ message: 'Category already exists' });
    return;
  }

  const category = await Category.create({
    name,
    status
  });

  if (category) {
    res.status(201).json(category);
  } else {
    res.status(400).json({ message: 'Invalid category data' });
  }
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = req.body.name || category.name;
    category.status = req.body.status || category.status;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    await Category.deleteOne({ _id: category._id });
    res.json({ message: 'Category removed' });
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});

export const deleteMultipleCategories = asyncHandler(async (req, res) => {
  const { categoryIds } = req.body;

  if (!categoryIds || categoryIds.length === 0) {
    res.status(400).json({ message: 'No category IDs provided' });
    return;
  }

  const result = await Category.deleteMany({ _id: { $in: categoryIds } });

  if (result.deletedCount > 0) {
    res.json({ message: `${result.deletedCount} categories removed` });
  } else {
    res.status(404).json({ message: 'No categories found with the provided IDs' });
  }
});


export const updateCategoryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const category = await Category.findById(req.params.id);

  if (category) {
    category.status = status;
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});