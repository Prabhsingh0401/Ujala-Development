import express from 'express';
import { getStates, getCitiesByState } from '../controllers/locationController.js';

const router = express.Router();

router.get('/states', getStates);
router.get('/cities/:state', getCitiesByState);

export default router;
