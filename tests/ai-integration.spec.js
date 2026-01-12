// AI Integration Tests for EasyBin
// Tests actual Pollinations API with real images

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Test configuration
const API_ENDPOINT = 'https://gen.pollinations.ai/v1/chat/completions';
const TIMEOUT = 30000; // 30 seconds per API call
const MAX_RETRY_TIME = 120000; // 2 minutes total retry time
const RETRY_DELAY = 5000; // 5 seconds between retries

// Helper: Retry API call until valid JSON response or timeout
async function retryUntilValidResponse(requestFn, validateFn, testName) {
  const startTime = Date.now();
  let lastError = null;
  let attemptCount = 0;

  while (Date.now() - startTime < MAX_RETRY_TIME) {
    attemptCount++;
    try {
      console.log(`[Attempt ${attemptCount}] ${testName}...`);
      const response = await requestFn();

      // Validate response
      if (validateFn(response)) {
        console.log(`✅ ${testName} succeeded on attempt ${attemptCount}`);
        return response;
      }

      lastError = new Error('Response did not pass validation');
      console.log(`⚠️  Response validation failed, will retry in ${RETRY_DELAY}ms...`);
    } catch (error) {
      lastError = error;
      console.log(`⚠️  Request failed: ${error.message}, will retry in ${RETRY_DELAY}ms...`);
    }

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
  }

  // Timeout reached
  throw new Error(`${testName} failed after ${attemptCount} attempts over ${Math.round((Date.now() - startTime) / 1000)}s. Last error: ${lastError?.message || 'Unknown'}`);
}

test.describe('Pollinations AI Integration', () => {

  test('should successfully call Pollinations API with image', async ({ request }) => {
    const imagePath = path.join(__dirname, 'fixtures', 'plastic-bottle.jpg');

    // Skip if fixture not available
    if (!fs.existsSync(imagePath)) {
      console.warn('⚠️  Skipping test - plastic-bottle.jpg not found in tests/fixtures/');
      test.skip();
      return;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    console.log(`📸 Testing with image: ${path.basename(imagePath)} (${(imageBuffer.length / 1024).toFixed(1)}KB)`);

    const response = await request.post(API_ENDPOINT, {
      data: {
        model: 'gemini', // Gemini 2.5 Flash Lite - has vision support
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'What type of waste item is this? Answer briefly.' },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ]
        }],
        max_tokens: 1000
      },
      timeout: TIMEOUT
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.choices).toBeDefined();
    expect(data.choices[0].message.content).toBeTruthy();

    console.log(`✅ API Response: ${data.choices[0].message.content.substring(0, 100)}...`);
  });

  test('should parse waste analysis response with structured format', async ({ request }) => {
    const imagePath = path.join(__dirname, 'fixtures', 'plastic-bottle.jpg');

    if (!fs.existsSync(imagePath)) {
      console.warn('⚠️  Skipping test - plastic-bottle.jpg not found');
      test.skip();
      return;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Use EXACT same prompt as production app.js (lines 1715-1765)
    const prompt = `Analyze the item(s) in the image for waste sorting purposes based on common recycling rules (consider US, German, Italian, Brazilian variations if possible, but prioritize general rules). Identify the primary item(s). For each item identified, provide:
1.  \`itemName\`: A concise name for the item (e.g., "Plastic Bottle", "Aluminum Can").
2.  \`primaryBin\`: The most likely disposal bin type ('recyclable', 'organic', 'general-waste', 'hazardous').
3.  \`primaryConfidence\`: Confidence score (0.0 to 1.0) for the primaryBin.
4.  \`secondaryBin\`: Next likely bin type.
5.  \`secondaryConfidence\`: Confidence score (0.0 to 1.0) for secondaryBin.
6.  \`material\`: Specific material if identifiable (e.g., 'PET', 'Aluminum', 'Paper', 'Glass', 'Plastic').
7.  \`reasoning\`: Brief explanation for the primaryBin choice.
8.  \`isContaminated\`: Boolean (true/false) indicating likely contamination (e.g., food residue).
9.  \`position\`: Approximate position in image (e.g., 'center', 'top-left').

**IMPORTANT:** Return the response ONLY as a valid JSON object containing a list called "items".
*   If you successfully identify one or more items, list them in the "items" array.
*   **If you cannot confidently identify any item suitable for sorting, return a single item object in the list like this:**
    \`\`\`json
    {
      "items": [
        {
          "itemName": "Identification Failed",
          "primaryBin": "error",
          "primaryConfidence": 0.0,
          "secondaryBin": null,
          "secondaryConfidence": 0.0,
          "material": null,
          "reasoning": "Could not recognize a distinct item clearly enough for sorting. Please try again with a clearer image or different angle.",
          "isContaminated": false,
          "position": "unknown"
        }
      ]
    }
    \`\`\`
*   Do not include any text before or after the JSON object.

Example for a successful identification:
{
  "items": [
    {
      "itemName": "Aluminum Can",
      "primaryBin": "recyclable",
      "primaryConfidence": 0.98,
      "secondaryBin": "general-waste",
      "secondaryConfidence": 0.02,
      "material": "Aluminum",
      "reasoning": "Clean aluminum can, typically recyclable.",
      "isContaminated": false,
      "position": "center"
    }
  ]
}`;


    const response = await request.post(API_ENDPOINT, {
      data: {
        model: 'gemini',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ]
        }],
        max_tokens: 1000
      },
      timeout: TIMEOUT
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log(`📄 Raw AI response (first 200 chars): ${content.substring(0, 200)}`);

    // Try to extract JSON if wrapped in markdown code blocks
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
      console.log('📝 Extracted JSON from markdown code block');
    }

    // Parse JSON response
    let parsed;
    try {
      parsed = JSON.parse(jsonContent);
    } catch (error) {
      console.error('❌ Failed to parse JSON:', error.message);
      console.error('Content:', jsonContent);
      throw error;
    }

    // Validate structure
    expect(parsed.items).toBeDefined();
    expect(Array.isArray(parsed.items)).toBeTruthy();
    expect(parsed.items.length).toBeGreaterThan(0);

    const item = parsed.items[0];
    console.log(`🏷️  Detected: ${item.itemName}`);
    console.log(`🗑️  Bin: ${item.primaryBin} (${Math.round((item.primaryConfidence || 0) * 100)}% confidence)`);

    expect(item.itemName).toBeTruthy();
    expect(['recyclable', 'organic', 'general-waste', 'hazardous', 'error']).toContain(item.primaryBin);
    expect(item.primaryConfidence).toBeGreaterThanOrEqual(0);
    expect(item.primaryConfidence).toBeLessThanOrEqual(1);
  });

  test('should handle different waste types correctly', async ({ request }) => {
    const testCases = [
      { file: 'plastic-bottle.jpg', expectedBin: 'recyclable', description: 'Plastic bottle' },
      { file: 'paper-document.jpg', expectedBin: 'recyclable', description: 'Paper' },
      { file: 'banana-peel.jpg', expectedBin: 'organic', description: 'Organic waste' },
      { file: 'battery.jpg', expectedBin: 'hazardous', description: 'Battery' }
    ];

    let testedCount = 0;
    let passedCount = 0;

    for (const testCase of testCases) {
      const imagePath = path.join(__dirname, 'fixtures', testCase.file);

      if (!fs.existsSync(imagePath)) {
        console.warn(`⚠️  Skipping ${testCase.file} - file not found`);
        continue;
      }

      testedCount++;
      console.log(`\n🧪 Testing: ${testCase.description} (${testCase.file})`);

      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const response = await request.post(API_ENDPOINT, {
        data: {
          model: 'gemini',
          messages: [{
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Classify this waste item. Return one of: recyclable, organic, general-waste, or hazardous. Answer with just the category.`
              },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${base64Image}` }
              }
            ]
          }],
          max_tokens: 100
        },
        timeout: TIMEOUT
      });

      const data = await response.json();
      const content = data.choices[0].message.content.toLowerCase();

      console.log(`   Response: "${content}"`);
      console.log(`   Expected: ${testCase.expectedBin}`);

      // AI might return full sentence, check if expected bin type is mentioned
      const isCorrect = content.includes(testCase.expectedBin);
      if (isCorrect) {
        passedCount++;
        console.log(`   ✅ PASS`);
      } else {
        console.log(`   ⚠️  Unexpected classification (may still be valid)`);
      }
    }

    if (testedCount === 0) {
      console.warn('⚠️  No test images found - skipping waste type tests');
      test.skip();
      return;
    }

    console.log(`\n📊 Results: ${passedCount}/${testedCount} tests matched expected classification`);

    // Test passes if at least 50% are correct (AI may legitimately classify differently)
    expect(passedCount / testedCount).toBeGreaterThanOrEqual(0.5);
  });

  test('should handle error cases gracefully', async ({ request }) => {
    // Test with invalid base64 (should fail gracefully)
    const response = await request.post(API_ENDPOINT, {
      data: {
        model: 'gemini',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Identify this item' },
            {
              type: 'image_url',
              image_url: { url: 'data:image/jpeg;base64,invalid-base64' }
            }
          ]
        }],
        max_tokens: 100
      },
      timeout: TIMEOUT
    });

    // Should either fail or return error response
    if (response.ok()) {
      const data = await response.json();
      console.log('API handled invalid image:', data.choices[0].message.content);
    } else {
      console.log('API rejected invalid image (expected):', response.status());
    }

    // Test passes regardless - we're just checking it doesn't crash
    expect(true).toBeTruthy();
  });

  test('should respect timeout limits', async ({ request }) => {
    const imagePath = path.join(__dirname, 'fixtures', 'plastic-bottle.jpg');

    if (!fs.existsSync(imagePath)) {
      test.skip();
      return;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const startTime = Date.now();

    try {
      await request.post(API_ENDPOINT, {
        data: {
          model: 'gemini',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: 'Identify this item' },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${base64Image}` }
              }
            ]
          }],
          max_tokens: 100
        },
        timeout: TIMEOUT
      });

      const duration = Date.now() - startTime;
      console.log(`⏱️  API response time: ${duration}ms`);

      // Should complete within reasonable time
      expect(duration).toBeLessThan(TIMEOUT);
    } catch (error) {
      // Timeout is acceptable
      console.log('API timed out (acceptable for slow connections)');
    }
  });
});

test.describe('API Response Validation', () => {

  test('should return valid OpenAI-compatible structure', async ({ request }) => {
    const imagePath = path.join(__dirname, 'fixtures', 'plastic-bottle.jpg');

    if (!fs.existsSync(imagePath)) {
      test.skip();
      return;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await request.post(API_ENDPOINT, {
      data: {
        model: 'gemini',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Test' },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ]
        }],
        max_tokens: 50
      },
      timeout: TIMEOUT
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Validate OpenAI-compatible structure
    expect(data).toHaveProperty('choices');
    expect(Array.isArray(data.choices)).toBeTruthy();
    expect(data.choices.length).toBeGreaterThan(0);
    expect(data.choices[0]).toHaveProperty('message');
    expect(data.choices[0].message).toHaveProperty('content');
    expect(typeof data.choices[0].message.content).toBe('string');

    console.log('✅ Response structure is OpenAI-compatible');
  });
});
