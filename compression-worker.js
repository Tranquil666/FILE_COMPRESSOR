// Web Worker for multi-threaded compression
// This worker handles compression tasks in a separate thread for better performance

self.importScripts(
    'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js'
);

// Set PDF.js worker source
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Listen for messages from main thread
self.addEventListener('message', async (e) => {
    const { type, fileData, options, id } = e.data;

    try {
        let result;

        switch (type) {
            case 'compress-pdf':
                result = await compressPDF(fileData, options);
                break;
            case 'compress-image':
                result = await compressImage(fileData, options);
                break;
            case 'compress-text':
                result = await compressText(fileData, options);
                break;
            default:
                throw new Error(`Unknown compression type: ${type}`);
        }

        self.postMessage({
            id,
            success: true,
            result
        });
    } catch (error) {
        self.postMessage({
            id,
            success: false,
            error: error.message
        });
    }
});

// PDF Compression with advanced techniques
async function compressPDF(arrayBuffer, options) {
    const { level, targetSize, quality } = options;

    // Load PDF
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Determine compression settings
    let imageQuality = quality || 0.7;
    let scale = 1.0;

    if (level === 'high') {
        imageQuality = 0.3;
        scale = 0.5;
    } else if (level === 'medium') {
        imageQuality = 0.5;
        scale = 0.7;
    } else if (level === 'low') {
        imageQuality = 0.8;
        scale = 0.9;
    }

    if (targetSize) {
        const ratio = targetSize / arrayBuffer.byteLength;
        imageQuality = Math.max(0.1, Math.min(0.9, ratio * 0.8));
        scale = Math.max(0.3, Math.sqrt(ratio));
    }

    // Create new PDF
    const newPdf = await PDFLib.PDFDocument.create();

    // Process all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: scale });

        // Create off-screen canvas with fallback
        let canvas, context;
        if (typeof OffscreenCanvas !== 'undefined') {
            canvas = new OffscreenCanvas(viewport.width, viewport.height);
            context = canvas.getContext('2d');
        } else {
            // Fallback: return error if OffscreenCanvas not supported
            throw new Error('OffscreenCanvas not supported in this environment');
        }

        if (!context) {
            throw new Error('Failed to get 2d context from canvas');
        }

        // Render page
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Convert to JPEG with compression
        const blob = await canvas.convertToBlob({
            type: 'image/jpeg',
            quality: imageQuality
        });

        if (!blob) {
            throw new Error('Failed to convert canvas to blob');
        }

        const imageBytes = new Uint8Array(await blob.arrayBuffer());
        const image = await newPdf.embedJpg(imageBytes);
        const newPage = newPdf.addPage([viewport.width, viewport.height]);

        newPage.drawImage(image, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height
        });
    }

    // Save with compression
    const pdfBytes = await newPdf.save({
        useObjectStreams: true,
        addDefaultPage: false
    });

    return pdfBytes.buffer;
}

// Image Compression
async function compressImage(arrayBuffer, options) {
    const { level, targetSize, quality, format } = options;

    // Create image bitmap
    const blob = new Blob([arrayBuffer]);

    if (typeof createImageBitmap === 'undefined') {
        throw new Error('createImageBitmap not supported in this environment');
    }

    const imageBitmap = await createImageBitmap(blob);

    // Calculate dimensions
    let scale = 1.0;
    if (level === 'high') scale = 0.5;
    else if (level === 'medium') scale = 0.7;
    else if (level === 'low') scale = 0.9;

    if (targetSize) {
        const ratio = targetSize / arrayBuffer.byteLength;
        scale = Math.max(0.2, Math.min(1.0, Math.sqrt(ratio)));
    }

    const width = Math.floor(imageBitmap.width * scale);
    const height = Math.floor(imageBitmap.height * scale);

    // Create canvas and draw scaled image with OffscreenCanvas check
    if (typeof OffscreenCanvas === 'undefined') {
        throw new Error('OffscreenCanvas not supported in this environment');
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Failed to get 2d context from canvas');
    }

    ctx.drawImage(imageBitmap, 0, 0, width, height);

    // Determine output format and quality
    let outputFormat = format || 'image/jpeg';
    let outputQuality = quality || 0.85;

    if (level === 'high') outputQuality = 0.6;
    else if (level === 'medium') outputQuality = 0.75;

    // Convert to blob
    const outputBlob = await canvas.convertToBlob({
        type: outputFormat,
        quality: outputQuality
    });

    return await outputBlob.arrayBuffer();
}

// Text/Document Compression using gzip/deflate
async function compressText(arrayBuffer, options) {
    const uint8Array = new Uint8Array(arrayBuffer);

    // Check if pako library is loaded
    if (typeof pako === 'undefined') {
        throw new Error('pako library not loaded');
    }

    // Use pako for gzip compression
    const compressed = pako.gzip(uint8Array, {
        level: options.level === 'high' ? 9 : options.level === 'medium' ? 6 : 3
    });

    return compressed.buffer;
}
