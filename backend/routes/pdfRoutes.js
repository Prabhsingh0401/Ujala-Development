import express from 'express';
import { generateBoxStickers, downloadMultiplePDFs, downloadCombinedPDFs } from '../controllers/pdfController.js';

const router = express.Router();

router.get('/stickers/:boxKey', generateBoxStickers);
router.post('/download-multiple', downloadMultiplePDFs);
router.post('/download-combined', downloadCombinedPDFs);

export default router;