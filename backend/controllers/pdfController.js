import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { OrderItem } from '../models/Order.js';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

// Centralized configuration for sticker layout and fonts
const stickerConfig = {
    width: 400,
    height: 250,
    margin: 10,
    font: {
        bold: 'Helvetica-Bold',
        regular: 'Helvetica',
        sizes: {
            title: 11,
            model: 10,
            serial: 9,
            specsLabel: 9,
            specsValue: 9,
            taxNote: 7,
            footer: 9,
        }
    },
    logo: {
        path: path.join(process.cwd(), 'public', 'Ujala_template_logo.png'),
        width: 100,
        yOffset: 0
    },
    qr: {
        width: 48,
        spacing: 8,
        yOffset: 0
    },
    columns: {
        leftRatio: 0.48,
        spacing: 25,
        leftTitleY: 75,
        leftModelY: 4,
        rightSpecsY: 72,
        specLabelWidth: 70,
    },
    serialBoxes: {
        yOffset: 10,
        boxWidthPadding: 30,
        boxHeight: 18,
        boxGap: 8,
        serialTopExtra: 8,
        serialAreaReserveFooter: 110,
    },
    footer: {
        yOffset: 40,
        lineSpacing: 10,
    }
};

let logoBuffer = null;
const loadLogo = () => {
    if (logoBuffer) return logoBuffer;
    try {
        logoBuffer = fs.readFileSync(stickerConfig.logo.path);
        return logoBuffer;
    } catch (error) {
        console.error('Error loading logo:', error);
        return null;
    }
};
loadLogo(); // Pre-load

const generateQRCode = async (data) => {
    try {
        const stringData = JSON.stringify(data);
        return await QRCode.toDataURL(stringData);
    } catch (error) {
        console.error('Error generating QR code:', error);
        return null;
    }
};

// This function remains the same, it's already correct.
const generateBoxSticker = async (doc, { type, items, qrCodes, model, startX = 10, startY = 10 }) => {
    const { width, height, margin, font, logo, qr, columns, serialBoxes, footer } = stickerConfig;

    doc.rect(startX, startY, width, height).stroke();
    doc.font(font.bold);
    
    const leftColX = startX + margin;
    const leftColWidth = width * columns.leftRatio;
    const rightColX = startX + leftColWidth + columns.spacing;
    const rightColWidth = width - leftColWidth - (margin * 2) - columns.spacing;

    // --- Left Column Content ---
    let yPositionLeft = startY + margin + logo.yOffset;

    const logoImage = loadLogo();
    if (logoImage) {
        doc.image(logoImage, leftColX + (leftColWidth - logo.width) / 2, yPositionLeft, { width: logo.width });
    }

    yPositionLeft = startY + columns.leftTitleY;
    doc.fontSize(font.sizes.title);
    ['SELF PRIMING', 'MONOBLOCK PUMP'].forEach(text => {
        doc.text(text, leftColX, yPositionLeft, { width: leftColWidth, align: 'center' });
        yPositionLeft += 16;
    });

    yPositionLeft += columns.leftModelY;
    doc.fontSize(font.sizes.model);
    const modelText = `MODEL : ${model?.name || 'N/A'}`;
    doc.text(modelText, leftColX, yPositionLeft, { width: leftColWidth, align: 'center' });

    const modelTextHeight = doc.heightOfString(modelText, { width: leftColWidth });
    yPositionLeft += modelTextHeight;

    // Serial numbers
    yPositionLeft += serialBoxes.yOffset;
    const serialBoxWidth = leftColWidth - serialBoxes.boxWidthPadding;
    const serialBoxX = leftColX + (serialBoxes.boxWidthPadding / 2);
    
    const serialAreaTop = yPositionLeft;
    const serialAreaBottom = startY + height - serialBoxes.serialAreaReserveFooter;
    const availableHeight = Math.max(0, serialAreaBottom - serialAreaTop);
    let totalBoxesH = items.length * serialBoxes.boxHeight + Math.max(0, items.length - 1) * serialBoxes.boxGap;
    let currentBoxGap = serialBoxes.boxGap;

    if (totalBoxesH > availableHeight) {
        currentBoxGap = Math.max(3, Math.floor((availableHeight - (items.length * serialBoxes.boxHeight)) / Math.max(1, items.length - 1)));
        totalBoxesH = items.length * serialBoxes.boxHeight + Math.max(0, items.length - 1) * currentBoxGap;
    }

    const boxesStartY = serialAreaTop + serialBoxes.serialTopExtra + Math.max(0, Math.floor((availableHeight - totalBoxesH) / 2));

    items.forEach((item, index) => {
        const boxY = boxesStartY + (index * (serialBoxes.boxHeight + currentBoxGap));
        doc.rect(serialBoxX, boxY, serialBoxWidth, serialBoxes.boxHeight).stroke();
        doc.fontSize(font.sizes.serial).text(`PUMP S.NO : ${item.serialNumber}`, serialBoxX + 6, boxY + 3, { width: serialBoxWidth - 12 });
    });

    // --- Right Column Content ---
    let yPositionRight = startY + margin + qr.yOffset;
    const qrCodeWidth = qr.width;
    const qrCodeSpacing = qr.spacing;

    if (qrCodes && qrCodes.length > 0) {
        if ((type === 'single_unit' || type === 'individual') && qrCodes[0]) {
            doc.image(qrCodes[0], rightColX + 6, yPositionRight, { width: qrCodeWidth });
            doc.image(qrCodes[0], rightColX + rightColWidth - qrCodeWidth - 6, yPositionRight, { width: qrCodeWidth });
        } else {
            const validQrCodes = qrCodes.filter(Boolean);
            const totalQrWidth = (validQrCodes.length * qrCodeWidth) + (Math.max(0, validQrCodes.length - 1) * qrCodeSpacing);
            const qrStartX = rightColX + Math.max(0, (rightColWidth - totalQrWidth) / 2);
            validQrCodes.forEach((qrCode, index) => {
                doc.image(qrCode, qrStartX + (index * (qrCodeWidth + qrCodeSpacing)), yPositionRight, { width: qrCodeWidth });
            });
        }
    }

    // --- Specifications Section ---
    yPositionRight = startY + columns.rightSpecsY;
    const specsData = model?.specifications || {};
    let displayWeight = 'N/A';
    if (specsData.grossWeight) {
        const multiplier = type.includes('outer') ? items.length : 1;
        displayWeight = `${(parseFloat(specsData.grossWeight) * multiplier).toFixed(3)}kg`;
    }
    const displayPrice = type === 'individual' ? `${specsData.mrpPrice || 'N/A'}/-` : `${specsData.mrpPrice || 'N/A'}/- Each`;
    let mfgDate = 'N/A';
    try {
        if (items[0]?.month && items[0]?.year) {
            mfgDate = new Date(items[0].year, items[0].month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
    } catch (e) { console.error("Invalid date format:", e); }

    const specItems = [
        ['QUANTITY', type.includes('outer_') ? `${items.length}N` : '1N'],
        ['GROSS.WT', displayWeight],
        ['kW/HP', specsData.kwHp || 'N/A'],
        ['Voltage', specsData.voltage || 'N/A'],
        ['MRP Rs.', displayPrice],
        ['MFG DATE', mfgDate],
    ];

    specItems.forEach(([label, value]) => {
        if (label === 'MFG DATE') yPositionRight += 5;
        doc.font(font.bold).fontSize(font.sizes.specsLabel).text(label, rightColX, yPositionRight);
        doc.font(font.regular).fontSize(font.sizes.specsValue).text(`: ${value}`, rightColX + columns.specLabelWidth, yPositionRight);
        yPositionRight += 16;
        if (label === 'MRP Rs.') {
            doc.fontSize(font.sizes.taxNote).text('(Incl of all taxes)', rightColX, yPositionRight - 6);
            yPositionRight += 2;
        }
    });

    // --- Footer ---
    const footerY = startY + height - footer.yOffset;
    doc.fontSize(font.sizes.footer);
    [
        'MKTD BY - SUPER POWER ENERGY',
        'F-40, Road No. 2 VKI Industrial Area, Jaipur, Rajasthan - 302013',
        'Email : ujalaustomers@gmail.com | Service No - Delhi : 8595725671 , Others : 63769 11917'
    ].forEach((line, index) => {
        doc.text(line, startX + margin, footerY + (index * footer.lineSpacing), { width: width - (margin * 2), align: 'center' });
    });
};

const createPdfStream = () => {
    const doc = new PDFDocument({ size: [842, 595], layout: 'landscape', margin: 20 });
    const chunks = [];
    doc.on('data', chunks.push.bind(chunks));
    const promise = new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));
    return { doc, promise };
};

const generatePDFForBox = async (boxKey) => {
    // This function is still needed for single box downloads and remains unchanged
    const [orderId, , boxNumber] = boxKey.split('-');
    const orderItems = await OrderItem.find({ orderId, boxNumber: parseInt(boxNumber) }).populate('category').populate('model');
    if (!orderItems.length) throw new Error(`Box not found for key: ${boxKey}`);

    const { doc, promise } = createPdfStream();
    const model = orderItems[0].model;
    const pageMargin = 20;
    const stickerHeight = stickerConfig.height;
    const verticalSpacing = 10;
    let currentY = pageMargin;

    const checkNewPage = (y) => {
        if (y + stickerHeight > doc.page.height - pageMargin) {
            doc.addPage();
            return pageMargin;
        }
        return y;
    };

    const boxQrCodes = await Promise.all(
        orderItems.map(item => generateQRCode({ serialNumber: item.serialNumber, model: item.model?.name, orderId: item.orderId }))
    );

    if (orderItems.length > 1) { // It's a multi-unit box
        currentY = checkNewPage(currentY);
        await generateBoxSticker(doc, {
            type: `outer_${orderItems.length}unit`, items: orderItems, qrCodes: boxQrCodes, model, startX: pageMargin, startY: currentY
        });
        for (let i = 0; i < orderItems.length; i++) {
            currentY += stickerHeight + verticalSpacing;
            currentY = checkNewPage(currentY);
            await generateBoxSticker(doc, {
                type: 'individual', items: [orderItems[i]], qrCodes: [boxQrCodes[i], boxQrCodes[i]], model: orderItems[i].model, startX: pageMargin, startY: currentY
            });
        }
    } else { // It's a single-unit box -> generate only one individual sticker (1N)
        currentY = checkNewPage(currentY);
        await generateBoxSticker(doc, {
            type: 'individual', items: [orderItems[0]], qrCodes: [boxQrCodes[0], boxQrCodes[0]], model, startX: pageMargin, startY: currentY
        });
        currentY += stickerHeight + verticalSpacing;
    }
    doc.end();
    return promise;
};

// ## FIXED FUNCTION ##
const generateCombinedPDF = async (orderItems) => {
    const { doc, promise } = createPdfStream();
    const pageMargin = 20;
    const stickerHeight = stickerConfig.height;
    const verticalSpacing = 10;
    let currentY = pageMargin;

    // Step 1: Group items by their box key
    const groupedByBox = orderItems.reduce((acc, item) => {
        const boxKey = `${item.orderId}-box-${item.boxNumber}`;
        if (!acc[boxKey]) {
            acc[boxKey] = [];
        }
        acc[boxKey].push(item);
        return acc;
    }, {});

    const checkNewPage = (y) => {
        if (y + stickerHeight > doc.page.height - pageMargin) {
            doc.addPage();
            return pageMargin;
        }
        return y;
    };

    // Step 2: Loop over each box group
    for (const boxKey in groupedByBox) {
        const itemsInBox = groupedByBox[boxKey];
        const model = itemsInBox[0].model; // Assume model is consistent per box

        const boxQrCodes = await Promise.all(
            itemsInBox.map(item => generateQRCode({ serialNumber: item.serialNumber, model: item.model?.name, orderId: item.orderId }))
        );

        // Step 3: Apply the same logic as generatePDFForBox
        if (itemsInBox.length > 1) { // It's a multi-unit box
            currentY = checkNewPage(currentY);
            // Generate the outer sticker for this box
            await generateBoxSticker(doc, {
                type: `outer_${itemsInBox.length}unit`, items: itemsInBox, qrCodes: boxQrCodes, model, startX: pageMargin, startY: currentY
            });
            // Generate individual stickers for this box
            for (let i = 0; i < itemsInBox.length; i++) {
                currentY += stickerHeight + verticalSpacing;
                currentY = checkNewPage(currentY);
                await generateBoxSticker(doc, {
                    type: 'individual', items: [itemsInBox[i]], qrCodes: [boxQrCodes[i], boxQrCodes[i]], model: itemsInBox[i].model, startX: pageMargin, startY: currentY
                });
            }
        } else { // It's a single-unit box -> generate only one individual sticker (1N)
            currentY = checkNewPage(currentY);
            await generateBoxSticker(doc, {
                type: 'individual', items: [itemsInBox[0]], qrCodes: [boxQrCodes[0], boxQrCodes[0]], model, startX: pageMargin, startY: currentY
            });
            // advance Y to reserve space before next box (kept for consistent separation between boxes)
            currentY += stickerHeight + verticalSpacing;
        }
        // Add a larger space between different boxes in the same PDF
        currentY += stickerHeight + verticalSpacing;
    }

    doc.end();
    return promise;
};

// --- API Controllers ---
export const generateBoxStickers = async (req, res) => {
    try {
        const { boxKey } = req.params;
        const pdf = await generatePDFForBox(boxKey);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `${req.query.download === 'true' ? 'attachment' : 'inline'}; filename="stickers-${boxKey}.pdf"`);
        res.send(pdf);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Error generating PDF', error: error.message });
    }
};

export const downloadMultiplePDFs = async (req, res) => {
    try {
        const { boxKeys } = req.body;
        if (!boxKeys || !Array.isArray(boxKeys) || boxKeys.length === 0) {
            return res.status(400).json({ message: 'Box keys array is required' });
        }
        const archive = archiver('zip', { zlib: { level: 9 } });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="stickers-batch.zip"');
        archive.pipe(res);
        for (const boxKey of boxKeys) {
            try {
                const pdf = await generatePDFForBox(boxKey);
                archive.append(pdf, { name: `box-stickers-${boxKey}.pdf` });
            } catch (error) {
                console.error(`Error for ${boxKey}:`, error.message);
                archive.append(`Failed for ${boxKey}: ${error.message}`, { name: `ERROR-${boxKey}.txt` });
            }
        }
        await archive.finalize();
    } catch (error) {
        console.error('Error generating ZIP:', error);
        res.status(500).json({ message: 'Error generating ZIP file' });
    }
};

export const downloadCombinedPDFs = async (req, res) => {
    try {
        const { itemIds } = req.body;
        if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({ message: 'Item IDs array is required' });
        }
        const orderItems = await OrderItem.find({ _id: { $in: itemIds } }).populate('category').populate('model');
        if (orderItems.length === 0) {
            return res.status(404).json({ message: 'No order items found' });
        }
        // Call the newly fixed function
        const pdf = await generateCombinedPDF(orderItems);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="combined-stickers-${Date.now()}.pdf"`);
        res.send(pdf);
    } catch (error) {
        console.error('Error generating combined PDF:', error);
        res.status(500).json({ message: 'Error generating combined PDF', error: error.message });
    }
};