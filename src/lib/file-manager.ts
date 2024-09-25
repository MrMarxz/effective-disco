import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { PDFDocument } from "pdf-lib";

export async function AddWatermarkToImage(files: File[]) {

    // Read the watermark image
    const watermarkPath = path.join(process.cwd(), 'public', 'watermark.png');
    const watermarkBuffer = await fs.readFile(watermarkPath);

    // Array to store watermarked files
    const watermarkedFiles: File[] = [];

    for (const file of files) {
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Convert ArrayBuffer to Buffer
        const buffer = Buffer.from(arrayBuffer);

        // Get dimensions of the input image
        const image = sharp(buffer);
        const metadata = await image.metadata();
        const width = metadata.width ?? 1000;

        // Resize watermark to a percentage of the main image (e.g., 20%)
        const watermarkWidth = Math.round(width * 0.2);
        const resizedWatermark = await sharp(watermarkBuffer)
            .resize(watermarkWidth, null, { fit: 'inside' })
            .composite([
                {
                    input: Buffer.from([255, 255, 255, 128]),
                    raw: {
                        width: 1,
                        height: 1,
                        channels: 4
                    },
                    tile: true,
                    blend: 'dest-in'
                }
            ])
            .toBuffer();

        // Add watermark
        const watermarkedBuffer = await sharp(buffer)
            .composite([
                {
                    input: resizedWatermark,
                    top: 10,
                    left: 10,
                },
            ])
            .toBuffer();

        // Create a new File object with the watermarked buffer
        const watermarkedFile = new File([watermarkedBuffer], file.name, { type: file.type });

        watermarkedFiles.push(watermarkedFile);
    }

    return watermarkedFiles;
}

export async function AddWaterToPDF(files: File[]) {
    const watermarkedFiles: File[] = [];

    // Read the watermark image
    const watermarkPath = path.join(process.cwd(), 'public', 'watermark.png');
    const watermarkBuffer = await fs.readFile(watermarkPath);

    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const watermarkImage = await pdfDoc.embedPng(watermarkBuffer);

        const pages = pdfDoc.getPages();
        for (const page of pages) {
            const { width, height } = page.getSize();
            const watermarkDims = watermarkImage.scale(0.2);
            page.drawImage(watermarkImage, {
                x: 10,
                y: height - watermarkDims.height - 10,
                width: watermarkDims.width,
                height: watermarkDims.height,
                opacity: 0.5
            });
        }

        const buffer = Buffer.from(await pdfDoc.save());
        const watermarkedFile = new File([buffer], file.name, { type: file.type });
        watermarkedFiles.push(watermarkedFile);
    }

    return watermarkedFiles;
}
