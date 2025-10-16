import express from 'express';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory, updateCategoryStatus, deleteMultipleCategories } from '../controllers/categoryController.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(createCategory)
  .delete(deleteMultipleCategories);

router.route('/:id')
  .get(getCategoryById)
  .put(updateCategory)
  .delete(deleteCategory);

router.route('/:id/status')
  .patch(updateCategoryStatus);

export default router;