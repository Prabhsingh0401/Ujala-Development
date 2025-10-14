import express from 'express';
import { generateBoxStickers, downloadMultiplePDFs } from '../controllers/pdfController.js';
import { getProductDetails } from '../controllers/qrController.js';

const router = express.Router();

router.get('/stickers/:boxKey', generateBoxStickers);
router.post('/download-multiple', downloadMultiplePDFs);
router.get('/product/:serialNumber', getProductDetails);

export default router;