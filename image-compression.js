// Image Compression Utility for EasyBin
// Reduces image size before sending to AI API to save bandwidth and improve performance

/**
 * Compress image captured from video stream
 * @param {HTMLCanvasElement} canvas - Canvas element for drawing
 * @param {CanvasRenderingContext2D} context - Canvas 2D context
 * @param {HTMLVideoElement} video - Video element with camera stream
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width (default: 1024)
 * @param {number} options.maxHeight - Maximum height (default: 1024)
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.8)
 * @returns {string} Compressed image as data URL
 */
function compressImage(canvas, context, video, options = {}) {
    const maxWidth = options.maxWidth || 1024;
    const maxHeight = options.maxHeight || 1024;
    const quality = options.quality || 0.8;

    let width = video.videoWidth;
    let height = video.videoHeight;

    // Calculate scaled dimensions maintaining aspect ratio
    if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
    }

    // Set canvas to scaled size
    canvas.width = width;
    canvas.height = height;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, width, height);

    // Convert to compressed JPEG
    const compressed = canvas.toDataURL('image/jpeg', quality);

    // Calculate and log compression stats
    const estimatedOriginalSize = (video.videoWidth * video.videoHeight * 3); // RGB estimate
    const compressedSize = Math.floor(compressed.length * 0.75); // Account for base64 overhead
    const compressionRatio = ((1 - compressedSize / estimatedOriginalSize) * 100).toFixed(1);

    console.log(`📸 Image compressed:`);
    console.log(`   Original: ${video.videoWidth}x${video.videoHeight} (~${(estimatedOriginalSize / 1024).toFixed(0)}KB)`);
    console.log(`   Compressed: ${width}x${height} (~${(compressedSize / 1024).toFixed(1)}KB)`);
    console.log(`   Compression: ${compressionRatio}% smaller`);
    console.log(`   Quality: ${(quality * 100).toFixed(0)}%`);

    return compressed;
}

/**
 * Get recommended compression settings based on video size
 * @param {number} width - Video width
 * @param {number} height - Video height
 * @returns {Object} Recommended settings
 */
function getRecommendedSettings(width, height) {
    const pixels = width * height;

    // 4K or higher
    if (pixels > 3840 * 2160) {
        return { maxWidth: 1024, maxHeight: 1024, quality: 0.75 };
    }

    // Full HD
    if (pixels > 1920 * 1080) {
        return { maxWidth: 1024, maxHeight: 1024, quality: 0.8 };
    }

    // HD
    if (pixels > 1280 * 720) {
        return { maxWidth: 1024, maxHeight: 1024, quality: 0.85 };
    }

    // Lower resolution - less aggressive compression
    return { maxWidth: 800, maxHeight: 800, quality: 0.9 };
}

// Export for use in app.js and tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { compressImage, getRecommendedSettings };
}
