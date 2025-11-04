import express from 'express';
import { getModels, getModelById, getModelsByCategory, createModel, updateModel, deleteModel, updateModelStatus, deleteMultipleModels, checkModelCode } from '../controllers/modelController.js';

const router = express.Router();

router.route('/')
  .get(getModels)
  .post(createModel)
  .delete(deleteMultipleModels);

router.route('/category/:categoryId')
  .get(getModelsByCategory);

router.route('/check-code/:code')
  .get(checkModelCode);

router.route('/:id')
  .get(getModelById)
  .put(updateModel)
  .delete(deleteModel);

router.route('/:id/status')
  .patch(updateModelStatus);

export default router;