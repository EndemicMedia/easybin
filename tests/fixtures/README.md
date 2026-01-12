# Test Fixtures

This directory contains test images for AI integration tests.

## Required Test Images

To run the full AI integration test suite, add the following images to this directory:

1. **plastic-bottle.jpg** - A clear photo of a plastic water bottle
   - Should be identified as: `recyclable`
   - Material: PET plastic
   - Size: ~200-500KB

2. **paper-document.jpg** - A white piece of paper or document
   - Should be identified as: `recyclable`
   - Material: Paper
   - Size: ~200-500KB

3. **banana-peel.jpg** - An organic waste item (banana peel, apple core, etc.)
   - Should be identified as: `organic`
   - Material: Food waste
   - Size: ~200-500KB

4. **battery.jpg** - A household battery (AA, AAA, etc.)
   - Should be identified as: `hazardous`
   - Material: Battery/electronics
   - Size: ~200-500KB

5. **mixed-items.jpg** - Multiple items in one image
   - Should detect: Multiple items
   - Used to test multi-item detection
   - Size: ~200-500KB

6. **blurry-image.jpg** - A blurry or out-of-focus image
   - Should return: Error response
   - Used to test error handling
   - Size: ~200-500KB

## How to Add Images

You can:
1. Take photos with your phone camera
2. Download from free stock photo sites (Unsplash, Pexels)
3. Use AI image generators (DALL-E, Midjourney, Stable Diffusion)

## Image Requirements

- Format: JPEG
- Size: 200KB - 1MB (will be compressed by app)
- Resolution: 640x480 minimum, 1920x1080 maximum
- No copyright restrictions

## Running Tests

Once images are added:

```bash
# Run AI integration tests
npm run test:ai

# Run all tests
npm run test:all
```

## Notes

- Tests will skip if fixture images are missing (with warning)
- You can start with just 1-2 images for initial testing
- More diverse images = better test coverage
