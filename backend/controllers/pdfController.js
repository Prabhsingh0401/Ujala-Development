import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { OrderItem } from '../models/Order.js';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const generateQRCode = async (data) => {
    try {
        return await QRCode.toDataURL(JSON.stringify(data));
    } catch (error) {
        console.error('Error generating QR code:', error);
        return null;
    }
};

const loadLogo = async () => {
    try {
        const logoPath = path.join(process.cwd(), 'public', 'Ujala_template_logo.png');
        return fs.readFileSync(logoPath);
    } catch (error) {
        console.error('Error loading logo:', error);
        return null;
    }
};

const generateBoxSticker = async (doc, { type, items, qrCodes, model, startX = 10, startY = 10 }) => {
    // Sticker dimensions (based on your image)
    const stickerWidth = 400;  // keep card width
    const stickerHeight = 250; // keep card height
    const innerMargin = 10;    // reduced margin to fit content tighter

    // Draw sticker border
    doc.rect(startX, startY, stickerWidth, stickerHeight)
       .stroke();

    // Set default font
    doc.font('Helvetica-Bold');
    
    // Calculate columns
    const leftColX = startX + innerMargin;
    const leftColWidth = stickerWidth * 0.48; // Adjusted width ratio
    const rightColX = startX + leftColWidth + 25; // Increased spacing between columns
    const rightColWidth = stickerWidth - leftColWidth - (innerMargin * 3);

    // Left Column
    let yPosition = startY + innerMargin;

    // Add logo centered in left column
    const logo = await loadLogo();
    if (logo) {
        const logoWidth = 100;
        const logoX = leftColX + (leftColWidth - logoWidth) / 2;
        doc.image(logo, logoX, yPosition, { width: logoWidth });
    }

    // Add title centered in left column (slightly smaller)
    yPosition = startY + 75;
    doc.fontSize(11);
    ['SELF PRIMING', 'MONOBLOCK PUMP'].forEach(text => {
        const textWidth = doc.widthOfString(text);
        const textX = leftColX + (leftColWidth - textWidth) / 2;
        doc.text(text, textX, yPosition);
        yPosition += 16;
    });

    // Add model centered (smaller)
    yPosition += 4;
    const modelText = `MODEL : ${model?.name || 'N/A'}`;
    doc.fontSize(10);
    const modelWidth = doc.widthOfString(modelText);
    const modelX = leftColX + (leftColWidth - modelWidth) / 2;
    doc.text(modelText, modelX, yPosition);

    // Serial numbers: center the stack vertically in left column area so 3 items look balanced
    yPosition += 12;
    const boxWidth = leftColWidth - 30;
    const boxX = leftColX + 15;
    const boxHeight = 18;
    let boxGap = 8;

    // compute available vertical area for serials (leave space for specs/footer)
    const serialAreaTop = yPosition;
    const serialAreaBottom = startY + stickerHeight - 110; // reserve space for specs and footer
    const availableHeight = Math.max(0, serialAreaBottom - serialAreaTop);

    let totalBoxesH = items.length * boxHeight + Math.max(0, items.length - 1) * boxGap;
    if (totalBoxesH > availableHeight) {
        // reduce gap if needed
        boxGap = Math.max(3, Math.floor((availableHeight - (items.length * boxHeight)) / Math.max(1, items.length - 1)));
        totalBoxesH = items.length * boxHeight + Math.max(0, items.length - 1) * boxGap;
    }

    // small extra top margin so boxes don't stick too close to model/title
    const serialTopExtra = 8;
    const boxesStartY = serialAreaTop + serialTopExtra + Math.max(0, Math.floor((availableHeight - totalBoxesH) / 2));

    items.forEach((item, index) => {
        const boxY = boxesStartY + (index * (boxHeight + boxGap));
        // Draw box
        doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();

        // Add serial number text left-aligned with small padding and reduced font
        const serialText = `PUMP S.NO : ${item.serialNumber}`;
        doc.fontSize(9);
        doc.text(serialText, boxX + 6, boxY + 3, { width: boxWidth - 12 });
    });

    // Right Column
    let rightColY = startY + innerMargin;

    // Add QR codes - use tighter spacing so codes sit side-by-side
    const qrWidth = 48; // slightly smaller to allow tighter grouping
    const qrSpacing = 8; // reduced spacing

    if ((type === 'single_unit' || type === 'individual') && qrCodes.length === 2) {
        // place near edges
        doc.image(qrCodes[0], rightColX + 6, rightColY, { width: qrWidth });
        doc.image(qrCodes[1], rightColX + rightColWidth - qrWidth - 6, rightColY, { width: qrWidth });
    } else {
        // center QR codes row for outer stickers
        const totalQrWidth = (qrCodes.length * qrWidth) + ((qrCodes.length - 1) * qrSpacing);
        const qrStartX = rightColX + Math.max(0, Math.floor((rightColWidth - totalQrWidth) / 2));
        qrCodes.forEach((qrCode, index) => {
            doc.image(qrCode, qrStartX + (index * (qrWidth + qrSpacing)), rightColY, { width: qrWidth });
        });
    }

    // Specifications section (move up to reduce top margin)
    rightColY = startY + 72; // Aligned a bit higher with title
    
    // Calculate weight and price based on sticker type
    const grossWeight = model?.specifications?.grossWeight || 'N/A';
    // For outer box stickers, multiply weight by number of units
    let displayWeight;
    if (type === 'individual' || type === 'single_unit') {
        // Individual stickers always show the original weight
        displayWeight = grossWeight !== 'N/A' ? grossWeight + '' : 'N/A';
    } else {
        // For outer box stickers (2N/3N), multiply the weight by number of units
        const unitType = items[0]?.orderType;
        let multiplier = 1;
        if (unitType === '2_units' || type === 'outer_2unit') multiplier = 2;
        else if (unitType === '3_units' || type === 'outer_3unit') multiplier = 3;

        displayWeight = grossWeight !== 'N/A' ? 
            (parseFloat(grossWeight) * multiplier).toFixed(3) + 'kg' : 
            'N/A';
    }
    
    const mrpPrice = model?.specifications?.mrpPrice || 'N/A';  
    const displayPrice = type === 'individual' ? 
        `${mrpPrice}/-` : 
        `${mrpPrice}/- Each`;
    
    const specs = [
        ['QUANTITY', type === 'outer_2unit' ? '2N' : type === 'outer_3unit' ? '3N' : '1N'],
        ['GROSS.WT', displayWeight],
        ['kW/HP', `${model?.specifications?.kwHp || 'N/A'}`],
        ['Voltage', `${model?.specifications?.voltage || 'N/A'}`],
        ['MRP Rs.', displayPrice],
        ['MFG DATE', `${items[0]?.month && items[0]?.year ? new Date(items[0].year, items[0].month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}`],
    ];

    const labelWidth = 70; // Fixed width for labels
    specs.forEach(([label, value], index) => {
        // Add extra margin for MFG DATE
        if (label === 'MFG DATE') {
            rightColY += 5;
        }
        
    // Increase font sizes for right-side specs
    doc.font('Helvetica-Bold');
    doc.fontSize(9);
    doc.text(`${label}`, rightColX, rightColY);
    doc.font('Helvetica');
    doc.fontSize(9);
    doc.text(`: ${value}`, rightColX + labelWidth, rightColY);
        
        // Add tax note right after MRP Rs.
        if (label === 'MRP Rs.') {
            rightColY += 10;
            doc.fontSize(7)
                .text('(Incl of all taxes)', rightColX, rightColY);
            rightColY += 8;
        } else {
            rightColY += 16; // Adjusted line spacing
        }
    });


    // Add footer centered
    const footerY = startY + stickerHeight - 40;
    const footerWidth = stickerWidth - (innerMargin * 2);
    const footerX = startX + innerMargin;

    doc.fontSize(9);
    [
        'MKTD BY - SUPER POWER ENERGY',
        'F-40, Road No. 2 VKI Industrial Area, Jaipur, Rajasthan - 302013',
        'Email : ujalaustomers@gmail.com | Service No - Delhi : 8595725671 , Others : 63769 11917'
    ].forEach((line, index) => {
        doc.text(line, footerX, footerY + (index * 10), { 
            width: footerWidth, 
            align: 'center'
        });
    });
};


const generatePDFForBox = async (boxKey) => {
    const [orderId, , boxNumber] = boxKey.split('-');
    
    const orderItems = await OrderItem.find({ 
        orderId, 
        boxNumber: parseInt(boxNumber) 
    }).populate('category').populate('model');
    
    if (!orderItems.length) {
        throw new Error('Box not found');
    }

    // Create a new PDF document
    const doc = new PDFDocument({
        size: [842, 595], // A4 landscape
        layout: 'landscape',
        margin: 20
    });

    // Store PDF in memory buffer
    const chunks = [];
    doc.on('data', chunks.push.bind(chunks));
    
    // Calculate positions for stickers on the page
    const pageMargin = 20;
    const pageWidth = doc.page.width - (pageMargin * 2);
    const pageHeight = doc.page.height - (pageMargin * 2);
    const stickerWidth = 400;  // Match the width from generateBoxSticker
    const stickerHeight = 250; // Match the sticker height used by generateBoxSticker
    const horizontalSpacing = 20;
    const verticalSpacing = 75; // Increased spacing for better separation
    // const stickersPerRow = Math.max(1, Math.floor(pageWidth / (stickerWidth + horizontalSpacing)));
    // const rowsPerPage = Math.max(1, Math.floor(pageHeight / (stickerHeight + verticalSpacing)));
    
    // Helper function to check if we need a new page
    const checkNewPage = (currentY) => {
        if (currentY + stickerHeight > pageHeight + pageMargin) {
            doc.addPage();
            return pageMargin;
        }
        return currentY;
    };
    
    if (orderItems[0].orderType === '2_units') {
        // Get QR codes for both items
        const qrCodes = await Promise.all(
            orderItems.map(item => generateQRCode({
                serialNumber: item.serialNumber,
                model: item.model?.name,
                category: item.category?.name,
                orderId: item.orderId
            }))
        );

        let currentY = pageMargin;

        // Generate outer box sticker
        currentY = checkNewPage(currentY);
        await generateBoxSticker(doc, {
            type: 'outer_2unit',
            items: orderItems,
            qrCodes,
            model: orderItems[0].model,
            startX: pageMargin,
            startY: currentY
        });

        // Generate individual stickers
        for (let i = 0; i < orderItems.length; i++) {
            currentY += stickerHeight + verticalSpacing;
            currentY = checkNewPage(currentY);
            await generateBoxSticker(doc, {
                type: 'individual',
                items: [orderItems[i]],
                qrCodes: [qrCodes[i], qrCodes[i]],
                model: orderItems[i].model,
                startX: pageMargin,
                startY: currentY
            });
        }
    } else if (orderItems[0].orderType === '3_units') {
        // Get QR codes for all three items
        const qrCodes = await Promise.all(
            orderItems.map(item => generateQRCode({
                serialNumber: item.serialNumber,
                model: item.model?.name,
                category: item.category?.name,
                orderId: item.orderId
            }))
        );

        let currentY = pageMargin;

        // Generate outer box sticker
        currentY = checkNewPage(currentY);
        await generateBoxSticker(doc, {
            type: 'outer_3unit',
            items: orderItems,
            qrCodes,
            model: orderItems[0].model,
            startX: pageMargin,
            startY: currentY
        });

        // Generate individual stickers
        for (let i = 0; i < orderItems.length; i++) {
            currentY += stickerHeight + verticalSpacing;
            currentY = checkNewPage(currentY);
            await generateBoxSticker(doc, {
                type: 'individual',
                items: [orderItems[i]],
                qrCodes: [qrCodes[i], qrCodes[i]],
                model: orderItems[i].model,
                startX: pageMargin,
                startY: currentY
            });
        }
    } else {
        // Single unit - generate QR code
        const qrCode = await generateQRCode({
            serialNumber: orderItems[0].serialNumber,
            model: orderItems[0].model?.name,
            category: orderItems[0].category?.name,
            orderId: orderItems[0].orderId
        });

        let currentY = pageMargin;
        
        // Generate first sticker
        currentY = checkNewPage(currentY);
        await generateBoxSticker(doc, {
            type: 'single_unit',
            items: [orderItems[0]],
            qrCodes: [qrCode, qrCode],
            model: orderItems[0].model,
            startX: pageMargin,
            startY: currentY
        });

        // Generate second sticker
        currentY += stickerHeight + verticalSpacing;
        currentY = checkNewPage(currentY);
        await generateBoxSticker(doc, {
            type: 'single_unit',
            items: [orderItems[0]],
            qrCodes: [qrCode, qrCode],
            model: orderItems[0].model,
            startX: pageMargin,
            startY: currentY
        });
    }

    // End the document
    doc.end();

    // Return promise that resolves with the PDF buffer
    return new Promise((resolve) => {
        doc.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
    });
};


export const generateBoxStickers = async (req, res) => {
    try {
        const { boxKey } = req.params;
        const { download } = req.query;
        
        const pdf = await generatePDFForBox(boxKey);
        
        res.setHeader('Content-Type', 'application/pdf');
        const disposition = download === 'true' ? 'attachment' : 'inline';
        res.setHeader('Content-Disposition', `${disposition}; filename="stickers-${boxKey}.pdf"`);
        res.send(pdf);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ 
            message: 'Error generating PDF',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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
                archive.append(pdf, { name: `stickers-${boxKey}.pdf` });
            } catch (error) {
                console.error(`Error generating PDF for ${boxKey}:`, error);
            }
        }
        
        await archive.finalize();
        
    } catch (error) {
        console.error('Error generating ZIP:', error);
        res.status(500).json({ message: 'Error generating ZIP file' });
    }
};