// Unit tests for image compression functionality
// Tests the compression utility without requiring browser environment

const { compressImage, getRecommendedSettings } = require('../../image-compression');

// Mock canvas and video for Node.js testing
function createMockCanvas(width, height) {
    const canvas = {
        width: 0,
        height: 0,
        getContext: () => ({
            drawImage: jest.fn()
        }),
        toDataURL: jest.fn((format, quality) => {
            // Simulate base64 data URL with size based on dimensions and quality
            const simulatedSize = Math.floor(width * height * quality * 0.1);
            const base64Data = 'A'.repeat(simulatedSize);
            return `data:${format};base64,${base64Data}`;
        })
    };
    return canvas;
}

function createMockVideo(width, height) {
    return {
        videoWidth: width,
        videoHeight: height
    };
}

describe('Image Compression', () => {

    describe('compressImage', () => {

        test('should compress large image to max dimensions', () => {
            const canvas = createMockCanvas(1920, 1080);
            const context = canvas.getContext('2d');
            const video = createMockVideo(1920, 1080);

            const result = compressImage(canvas, context, video, {
                maxWidth: 1024,
                maxHeight: 1024,
                quality: 0.8
            });

            // Canvas should be resized
            expect(canvas.width).toBeLessThanOrEqual(1024);
            expect(canvas.height).toBeLessThanOrEqual(1024);

            // Should return data URL
            expect(result).toMatch(/^data:image\/jpeg;base64,/);
        });

        test('should maintain aspect ratio when scaling', () => {
            const canvas = createMockCanvas(1920, 1080);
            const context = canvas.getContext('2d');
            const video = createMockVideo(1920, 1080);

            compressImage(canvas, context, video, {
                maxWidth: 1024,
                maxHeight: 1024,
                quality: 0.8
            });

            // Calculate aspect ratio
            const originalRatio = 1920 / 1080;
            const newRatio = canvas.width / canvas.height;

            // Ratios should be approximately equal (within 0.01)
            expect(Math.abs(originalRatio - newRatio)).toBeLessThan(0.01);
        });

        test('should not upscale small images', () => {
            const canvas = createMockCanvas(640, 480);
            const context = canvas.getContext('2d');
            const video = createMockVideo(640, 480);

            compressImage(canvas, context, video, {
                maxWidth: 1024,
                maxHeight: 1024,
                quality: 0.8
            });

            // Should keep original size or smaller
            expect(canvas.width).toBeLessThanOrEqual(640);
            expect(canvas.height).toBeLessThanOrEqual(480);
        });

        test('should use specified quality setting', () => {
            const canvas = createMockCanvas(1920, 1080);
            const context = canvas.getContext('2d');
            const video = createMockVideo(1920, 1080);

            const highQuality = compressImage(canvas, context, video, {
                maxWidth: 1024,
                maxHeight: 1024,
                quality: 0.95
            });

            const lowQuality = compressImage(canvas, context, video, {
                maxWidth: 1024,
                maxHeight: 1024,
                quality: 0.5
            });

            // Higher quality should result in larger data
            expect(highQuality.length).toBeGreaterThan(lowQuality.length);
        });

        test('should call drawImage with correct parameters', () => {
            const canvas = createMockCanvas(1920, 1080);
            const context = canvas.getContext('2d');
            const video = createMockVideo(1920, 1080);

            compressImage(canvas, context, video, {
                maxWidth: 1024,
                maxHeight: 1024,
                quality: 0.8
            });

            expect(context.drawImage).toHaveBeenCalledWith(
                video,
                0,
                0,
                expect.any(Number),
                expect.any(Number)
            );
        });

        test('should handle portrait orientation', () => {
            const canvas = createMockCanvas(1080, 1920);
            const context = canvas.getContext('2d');
            const video = createMockVideo(1080, 1920);

            compressImage(canvas, context, video, {
                maxWidth: 1024,
                maxHeight: 1024,
                quality: 0.8
            });

            // Width should be scaled down
            expect(canvas.width).toBeLessThanOrEqual(1024);
            // Height should be scaled proportionally
            expect(canvas.height).toBeLessThanOrEqual(1024);
        });
    });

    describe('getRecommendedSettings', () => {

        test('should recommend aggressive compression for 4K', () => {
            const settings = getRecommendedSettings(7680, 4320); // 8K > 4K threshold

            expect(settings.maxWidth).toBe(1024);
            expect(settings.maxHeight).toBe(1024);
            expect(settings.quality).toBe(0.75);
        });

        test('should recommend moderate compression for Full HD', () => {
            const settings = getRecommendedSettings(2560, 1440); // 2K > Full HD threshold

            expect(settings.maxWidth).toBe(1024);
            expect(settings.maxHeight).toBe(1024);
            expect(settings.quality).toBe(0.8);
        });

        test('should recommend light compression for HD', () => {
            const settings = getRecommendedSettings(1280, 720);

            expect(settings.maxWidth).toBe(800); // HD uses less aggressive max size
            expect(settings.maxHeight).toBe(800);
            expect(settings.quality).toBe(0.9); // HD uses higher quality
        });

        test('should use less aggressive settings for lower resolutions', () => {
            const settings = getRecommendedSettings(640, 480);

            expect(settings.maxWidth).toBe(800);
            expect(settings.maxHeight).toBe(800);
            expect(settings.quality).toBe(0.9);
        });

        test('should work with any resolution', () => {
            const testCases = [
                [7680, 4320],  // 8K
                [2560, 1440],  // 2K
                [800, 600],    // SVGA
                [320, 240]     // QVGA
            ];

            testCases.forEach(([width, height]) => {
                const settings = getRecommendedSettings(width, height);

                expect(settings).toHaveProperty('maxWidth');
                expect(settings).toHaveProperty('maxHeight');
                expect(settings).toHaveProperty('quality');
                expect(settings.quality).toBeGreaterThan(0);
                expect(settings.quality).toBeLessThanOrEqual(1);
            });
        });
    });

    describe('Compression effectiveness', () => {

        test('should significantly reduce file size for large images', () => {
            const canvas = createMockCanvas(3840, 2160);
            const context = canvas.getContext('2d');
            const video = createMockVideo(3840, 2160);

            // Simulate original size
            const originalSize = 3840 * 2160 * 3; // RGB estimate

            const compressed = compressImage(canvas, context, video, {
                maxWidth: 1024,
                maxHeight: 1024,
                quality: 0.75
            });

            // Compressed should be much smaller
            const compressedSize = compressed.length * 0.75; // Account for base64 overhead
            const compressionRatio = compressedSize / originalSize;

            expect(compressionRatio).toBeLessThan(0.1); // Should be <10% of original
        });
    });
});
