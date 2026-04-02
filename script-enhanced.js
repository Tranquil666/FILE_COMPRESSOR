// Universal File Compressor - Enhanced Version
// Supports PDF, Images, Documents, and Archives with advanced compression

class UniversalFileCompressor {
    constructor() {
        this.selectedFiles = [];
        this.compressedFiles = [];
        this.isProcessing = false;
        this.workers = [];
        this.maxWorkers = navigator.hardwareConcurrency || 4;

        this.supportedFormats = {
            pdf: ['application/pdf'],
            image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff'],
            document: ['text/plain', 'text/html', 'text/css', 'text/javascript', 'application/json', 'application/xml'],
            archive: ['application/zip', 'application/x-zip-compressed']
        };

        this.compressionPresets = {
            maximum: { level: 'high', quality: 0.3, scale: 0.5, description: 'Maximum compression, lowest quality' },
            balanced: { level: 'medium', quality: 0.6, scale: 0.7, description: 'Balanced compression and quality' },
            quality: { level: 'low', quality: 0.85, scale: 0.9, description: 'High quality, moderate compression' },
            custom: { level: 'custom', quality: 0.7, scale: 0.8, description: 'Custom settings' }
        };

        this.stats = {
            totalOriginalSize: 0,
            totalCompressedSize: 0,
            compressionTime: 0,
            filesProcessed: 0
        };

        this.initializeElements();
        this.bindEvents();
        this.initializeWorkers();
    }

    initializeElements() {
        // Main elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadSection = document.getElementById('uploadSection');
        this.optionsSection = document.getElementById('optionsSection');
        this.filesSection = document.getElementById('filesSection');
        this.progressSection = document.getElementById('progressSection');
        this.resultsSection = document.getElementById('resultsSection');

        // File management
        this.filesList = document.getElementById('filesList');
        this.clearAllBtn = document.getElementById('clearAllBtn');

        // Compression controls
        this.compressBtn = document.getElementById('compressBtn');
        this.compressionInputs = document.querySelectorAll('input[name="compression"]');
        this.targetSizeGroup = document.getElementById('targetSizeGroup');
        this.targetSizeSlider = document.getElementById('targetSizeSlider');
        this.targetSizeInput = document.getElementById('targetSizeInput');

        // Progress
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.currentFile = document.getElementById('currentFile');

        // Results
        this.resultsStats = document.getElementById('resultsStats');
        this.resultsFiles = document.getElementById('resultsFiles');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        this.compressMoreBtn = document.getElementById('compressMoreBtn');
    }

    initializeWorkers() {
        // Initialize Web Workers for parallel compression
        for (let i = 0; i < this.maxWorkers; i++) {
            try {
                const worker = new Worker('compression-worker.js');
                worker.onmessage = (e) => this.handleWorkerMessage(e);
                worker.onerror = (e) => this.handleWorkerError(e);
                this.workers.push({ worker, busy: false });
            } catch (error) {
                console.warn('Web Workers not available, using fallback:', error);
                break;
            }
        }
        console.log(`Initialized ${this.workers.length} compression workers`);
    }

    bindEvents() {
        // File upload
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Buttons
        this.compressBtn.addEventListener('click', () => this.compressFiles());
        this.clearAllBtn.addEventListener('click', () => this.clearAllFiles());
        this.downloadAllBtn.addEventListener('click', () => this.downloadAllFiles());
        this.compressMoreBtn.addEventListener('click', () => this.resetApplication());

        // Compression level changes
        this.compressionInputs.forEach(input => {
            input.addEventListener('change', () => this.handleCompressionLevelChange());
        });

        // File list events - use event delegation
        this.filesList.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-file-btn');
            if (removeBtn) {
                const index = parseInt(removeBtn.dataset.index);
                this.removeFile(index);
            }
        });

        // Results events - use event delegation
        this.resultsFiles.addEventListener('click', (e) => {
            const downloadBtn = e.target.closest('.download-btn');
            if (downloadBtn) {
                const index = parseInt(downloadBtn.dataset.index);
                this.downloadFile(index);
            }
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');

        const files = Array.from(e.dataTransfer.files);
        this.addFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addFiles(files);
    }

    addFiles(files) {
        const validFiles = [];
        const invalidFiles = [];

        files.forEach(file => {
            if (this.isValidFile(file)) {
                if (!this.selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
                    validFiles.push(file);
                    this.selectedFiles.push(file);
                }
            } else {
                invalidFiles.push(file.name);
            }
        });

        if (validFiles.length > 0) {
            this.renderFilesList();
            this.showSection('filesSection');
            this.showSection('optionsSection');
            this.showNotification(`Added ${validFiles.length} file(s)`, 'success');
        }

        if (invalidFiles.length > 0) {
            this.showNotification(`Unsupported files: ${invalidFiles.join(', ')}`, 'warning');
        }
    }

    isValidFile(file) {
        // Check if file type is supported
        for (const category in this.supportedFormats) {
            if (this.supportedFormats[category].includes(file.type)) {
                return true;
            }
        }
        // Also accept files without MIME type but with known extensions
        const ext = file.name.split('.').pop().toLowerCase();
        const extMap = {
            'pdf': true, 'jpg': true, 'jpeg': true, 'png': true, 'webp': true,
            'txt': true, 'html': true, 'css': true, 'js': true, 'json': true,
            'zip': true, 'svg': true
        };
        return extMap[ext] || false;
    }

    getFileCategory(file) {
        for (const [category, types] of Object.entries(this.supportedFormats)) {
            if (types.includes(file.type)) {
                return category;
            }
        }
        // Fallback to extension-based detection
        const ext = file.name.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) return 'pdf';
        if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
        if (['txt', 'html', 'css', 'js', 'json', 'xml'].includes(ext)) return 'document';
        return 'unknown';
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.renderFilesList();

        if (this.selectedFiles.length === 0) {
            this.hideSection('filesSection');
            this.hideSection('optionsSection');
        }
    }

    clearAllFiles() {
        this.selectedFiles = [];
        this.hideSection('filesSection');
        this.hideSection('optionsSection');
    }

    handleCompressionLevelChange() {
        const selectedLevel = document.querySelector('input[name="compression"]:checked').value;

        if (selectedLevel === 'custom') {
            this.targetSizeGroup.style.display = 'block';
        } else {
            this.targetSizeGroup.style.display = 'none';
        }
    }

    renderFilesList() {
        this.filesList.innerHTML = '';

        this.selectedFiles.forEach((file, index) => {
            const category = this.getFileCategory(file);
            const icon = this.getFileIcon(category);

            const fileItem = document.createElement('div');
            fileItem.className = 'file-item fade-in';

            fileItem.innerHTML = `
                <div class="file-info-left">
                    <i class="fas ${icon} file-icon"></i>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <p>${this.formatFileSize(file.size)} • ${category.toUpperCase()}</p>
                    </div>
                </div>
                <button class="remove-file-btn" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;

            this.filesList.appendChild(fileItem);
        });
    }

    getFileIcon(category) {
        const icons = {
            pdf: 'fa-file-pdf',
            image: 'fa-file-image',
            document: 'fa-file-alt',
            archive: 'fa-file-archive',
            unknown: 'fa-file'
        };
        return icons[category] || icons.unknown;
    }

    async compressFiles() {
        if (this.selectedFiles.length === 0 || this.isProcessing) return;

        this.isProcessing = true;
        this.compressedFiles = [];
        this.stats = {
            totalOriginalSize: 0,
            totalCompressedSize: 0,
            compressionTime: 0,
            filesProcessed: 0
        };

        // Get compression settings
        const compressionLevel = document.querySelector('input[name="compression"]:checked').value;
        const preset = this.compressionPresets[compressionLevel] || this.compressionPresets.balanced;
        const targetSize = compressionLevel === 'custom' ? parseInt(this.targetSizeInput.value) * 1024 : null;

        // Show progress
        this.hideSection('uploadSection');
        this.hideSection('optionsSection');
        this.hideSection('filesSection');
        this.showSection('progressSection');

        const startTime = performance.now();

        try {
            // Process files in parallel using workers
            if (this.workers.length > 0) {
                await this.compressFilesParallel(preset, targetSize);
            } else {
                await this.compressFilesSequential(preset, targetSize);
            }

            this.stats.compressionTime = performance.now() - startTime;

            if (this.compressedFiles.length > 0) {
                this.showResults();
                this.showNotification(`Compressed ${this.compressedFiles.length} file(s) successfully!`, 'success');
            } else {
                this.showNotification('No files could be compressed', 'error');
                this.resetApplication();
            }

        } catch (error) {
            console.error('Compression error:', error);
            this.showNotification('Compression failed: ' + error.message, 'error');
            this.resetApplication();
        } finally {
            this.isProcessing = false;
        }
    }

    async compressFilesParallel(preset, targetSize) {
        const tasks = this.selectedFiles.map((file, index) => ({
            file,
            index,
            preset,
            targetSize
        }));

        const results = await Promise.allSettled(
            tasks.map(task => this.compressFileWithWorker(task))
        );

        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                this.compressedFiles.push(result.value);
            }

            const progress = ((index + 1) / this.selectedFiles.length) * 100;
            this.updateProgress(progress, `Processing file ${index + 1} of ${this.selectedFiles.length}`);
        });
    }

    async compressFileWithWorker(task) {
        const { file, preset, targetSize } = task;
        const category = this.getFileCategory(file);

        // Find available worker
        const availableWorker = this.workers.find(w => !w.busy);
        if (!availableWorker) {
            // Fallback to non-worker compression
            return await this.compressFileFallback(file, preset, targetSize, category);
        }

        availableWorker.busy = true;

        return new Promise(async (resolve, reject) => {
            const id = Math.random().toString(36).substr(2, 9);
            const arrayBuffer = await file.arrayBuffer();

            const messageHandler = (e) => {
                if (e.data.id === id) {
                    availableWorker.worker.removeEventListener('message', messageHandler);
                    availableWorker.busy = false;

                    if (e.data.success) {
                        const compressedFile = new File([e.data.result], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        });

                        this.stats.totalOriginalSize += file.size;
                        this.stats.totalCompressedSize += compressedFile.size;
                        this.stats.filesProcessed++;

                        resolve({
                            original: file,
                            compressed: compressedFile,
                            compressionRatio: ((file.size - compressedFile.size) / file.size * 100).toFixed(1)
                        });
                    } else {
                        reject(new Error(e.data.error));
                    }
                }
            };

            availableWorker.worker.addEventListener('message', messageHandler);

            // Send compression task to worker
            const taskType = category === 'pdf' ? 'compress-pdf' :
                            category === 'image' ? 'compress-image' :
                            'compress-text';

            availableWorker.worker.postMessage({
                type: taskType,
                fileData: arrayBuffer,
                options: {
                    level: preset.level,
                    quality: preset.quality,
                    scale: preset.scale,
                    targetSize
                },
                id
            }, [arrayBuffer]);
        });
    }

    async compressFilesSequential(preset, targetSize) {
        for (let i = 0; i < this.selectedFiles.length; i++) {
            const file = this.selectedFiles[i];
            const category = this.getFileCategory(file);

            this.updateProgress(
                ((i + 1) / this.selectedFiles.length) * 100,
                `Compressing ${file.name}...`
            );

            try {
                const result = await this.compressFileFallback(file, preset, targetSize, category);
                if (result) {
                    this.compressedFiles.push(result);
                }
            } catch (error) {
                console.error(`Error compressing ${file.name}:`, error);
                this.showNotification(`Failed to compress ${file.name}`, 'error');
            }
        }
    }

    async compressFileFallback(file, preset, targetSize, category) {
        // Fallback compression without workers
        const arrayBuffer = await file.arrayBuffer();
        let compressedBuffer;

        try {
            if (category === 'pdf') {
                compressedBuffer = await this.compressPDFFallback(arrayBuffer, preset, targetSize);
            } else if (category === 'image') {
                compressedBuffer = await this.compressImageFallback(arrayBuffer, file.type, preset, targetSize);
            } else if (category === 'document') {
                compressedBuffer = await this.compressTextFallback(arrayBuffer, preset);
            } else {
                return null;
            }

            if (!compressedBuffer || compressedBuffer.byteLength >= file.size) {
                return null; // No compression achieved
            }

            const compressedFile = new File([compressedBuffer], file.name, {
                type: file.type,
                lastModified: Date.now()
            });

            this.stats.totalOriginalSize += file.size;
            this.stats.totalCompressedSize += compressedFile.size;
            this.stats.filesProcessed++;

            return {
                original: file,
                compressed: compressedFile,
                compressionRatio: ((file.size - compressedFile.size) / file.size * 100).toFixed(1)
            };

        } catch (error) {
            console.error('Fallback compression error:', error);
            return null;
        }
    }

    async compressPDFFallback(arrayBuffer, preset, targetSize) {
        // Use existing PDF compression logic from original script
        if (typeof PDFLib === 'undefined' || typeof pdfjsLib === 'undefined') {
            throw new Error('PDF libraries not loaded');
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const newPdf = await PDFLib.PDFDocument.create();

        const quality = preset.quality;
        const scale = preset.scale;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;

            const imageDataUrl = canvas.toDataURL('image/jpeg', quality);
            const imageBytes = this.dataURLToUint8Array(imageDataUrl);

            const image = await newPdf.embedJpg(imageBytes);
            const newPage = newPdf.addPage([viewport.width, viewport.height]);
            newPage.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height });
        }

        const pdfBytes = await newPdf.save({ useObjectStreams: true, addDefaultPage: false });
        return pdfBytes.buffer;
    }

    async compressImageFallback(arrayBuffer, mimeType, preset, targetSize) {
        return new Promise((resolve, reject) => {
            const blob = new Blob([arrayBuffer], { type: mimeType });
            const img = new Image();
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                URL.revokeObjectURL(url);

                const scale = preset.scale;
                const quality = preset.quality;

                const canvas = document.createElement('canvas');
                canvas.width = Math.floor(img.width * scale);
                canvas.height = Math.floor(img.height * scale);

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            blob.arrayBuffer().then(resolve).catch(reject);
                        } else {
                            reject(new Error('Failed to create compressed blob'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };

            img.src = url;
        });
    }

    async compressTextFallback(arrayBuffer, preset) {
        // Simple gzip-like compression using pako if available
        if (typeof pako !== 'undefined') {
            const uint8Array = new Uint8Array(arrayBuffer);
            const compressed = pako.gzip(uint8Array, {
                level: preset.level === 'high' ? 9 : preset.level === 'medium' ? 6 : 3
            });
            return compressed.buffer;
        }
        return null;
    }

    dataURLToUint8Array(dataURL) {
        const base64 = dataURL.split(',')[1];
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    handleWorkerMessage(e) {
        // Worker message handling is done in compressFileWithWorker
    }

    handleWorkerError(e) {
        console.error('Worker error:', e);
        this.showNotification('Worker error occurred', 'error');
    }

    updateProgress(percentage, message) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${Math.round(percentage)}%`;
        this.currentFile.textContent = message;
    }

    showResults() {
        this.hideSection('progressSection');
        this.showSection('resultsSection');

        const totalSavings = this.stats.totalOriginalSize - this.stats.totalCompressedSize;
        const averageCompression = this.stats.totalOriginalSize > 0
            ? (totalSavings / this.stats.totalOriginalSize * 100).toFixed(1)
            : 0;
        const compressionSpeed = this.stats.compressionTime > 0
            ? (this.stats.totalOriginalSize / 1024 / 1024 / (this.stats.compressionTime / 1000)).toFixed(2)
            : 0;

        this.resultsStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-value">${this.compressedFiles.length}</span>
                <span class="stat-label">Files Processed</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${this.formatFileSize(totalSavings)}</span>
                <span class="stat-label">Space Saved</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${averageCompression}%</span>
                <span class="stat-label">Average Compression</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${compressionSpeed} MB/s</span>
                <span class="stat-label">Processing Speed</span>
            </div>
        `;

        this.resultsFiles.innerHTML = '';
        this.compressedFiles.forEach((fileData, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-file-item fade-in';

            resultItem.innerHTML = `
                <div class="result-file-info">
                    <i class="fas fa-file-pdf file-icon"></i>
                    <div class="file-details">
                        <h4>${fileData.original.name}</h4>
                        <p>${this.formatFileSize(fileData.original.size)} → ${this.formatFileSize(fileData.compressed.size)}</p>
                    </div>
                    <span class="compression-badge">${fileData.compressionRatio}%</span>
                </div>
                <button class="download-btn" data-index="${index}">
                    <i class="fas fa-download"></i>
                    Download
                </button>
            `;

            this.resultsFiles.appendChild(resultItem);
        });
    }

    downloadFile(index) {
        const fileData = this.compressedFiles[index];
        const url = URL.createObjectURL(fileData.compressed);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compressed_${fileData.original.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async downloadAllFiles() {
        if (this.compressedFiles.length === 1) {
            this.downloadFile(0);
            return;
        }

        // Download files individually with delay
        for (let i = 0; i < this.compressedFiles.length; i++) {
            setTimeout(() => this.downloadFile(i), i * 500);
        }
    }

    resetApplication() {
        this.selectedFiles = [];
        this.compressedFiles = [];
        this.isProcessing = false;
        this.stats = {
            totalOriginalSize: 0,
            totalCompressedSize: 0,
            compressionTime: 0,
            filesProcessed: 0
        };

        this.showSection('uploadSection');
        this.hideSection('optionsSection');
        this.hideSection('filesSection');
        this.hideSection('progressSection');
        this.hideSection('resultsSection');

        this.fileInput.value = '';
        document.querySelector('input[name="compression"][value="medium"]').checked = true;
        this.handleCompressionLevelChange();
    }

    showSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
            section.classList.add('fade-in');
        }
    }

    hideSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
            section.classList.remove('fade-in');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1001;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };
        return colors[type] || '#2196f3';
    }

    cleanup() {
        // Cleanup workers
        this.workers.forEach(({ worker }) => worker.terminate());
        this.workers = [];
    }
}

// Initialize the application
let compressor;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Universal File Compressor...');
    compressor = new UniversalFileCompressor();

    // Wait for libraries to load
    const checkLibraries = setInterval(() => {
        if (typeof PDFLib !== 'undefined' && typeof pdfjsLib !== 'undefined') {
            clearInterval(checkLibraries);
            console.log('All libraries loaded successfully');
            compressor.showNotification('Ready to compress files!', 'success');
        }
    }, 100);
});

// Cleanup on page unload
window.addEventListener('beforeunload', (e) => {
    if (compressor) {
        if (compressor.isProcessing) {
            e.preventDefault();
            e.returnValue = 'Compression in progress. Are you sure you want to leave?';
            return e.returnValue;
        }
        compressor.cleanup();
    }
});
