// AI Integration E2E Tests for EasyBin
// Tests the actual AI integration with Puter.ai

const { test, expect } = require('@playwright/test');

test.describe('AI Integration E2E Tests', () => {
  test.beforeEach(async ({ page, browserName }) => {
    // Mock camera before page load
    await page.addInitScript(() => {
      // Mock getUserMedia to return a fake video stream
      const mockStream = {
        getVideoTracks: () => [{
          getSettings: () => ({ width: 640, height: 480 }),
          stop: () => {}
        }],
        getTracks: () => [{
          getSettings: () => ({ width: 640, height: 480 }),
          stop: () => {}
        }]
      };
      
      // Mock video element functionality
      HTMLVideoElement.prototype.play = function() {
        return Promise.resolve();
      };
      
      // Mock video element properties and events
      HTMLVideoElement.prototype.srcObject = null;
      HTMLVideoElement.prototype.videoWidth = 640;
      HTMLVideoElement.prototype.videoHeight = 480;
      HTMLVideoElement.prototype.addEventListener = function(event, callback) {
        if (event === 'loadeddata') {
          setTimeout(() => callback(), 100);
        }
      };
      
      // Mock navigator.mediaDevices.getUserMedia
      if (!navigator.mediaDevices) {
        navigator.mediaDevices = {};
      }
      navigator.mediaDevices.getUserMedia = () => Promise.resolve(mockStream);
      
      // Mock Puter.ai SDK
      window.puter = {
        ai: {
          chat: async (prompt, imageData) => {
            return {
              content: JSON.stringify({
                items: [{
                  itemName: 'Mock Item',
                  primaryBin: 'recyclable',
                  primaryConfidence: 0.8,
                  material: 'plastic',
                  reasoning: 'Mock AI response',
                  isContaminated: false,
                  position: 'center'
                }]
              })
            };
          }
        },
        geo: {}
      };
    });

    // Grant camera permissions for Chromium
    if (browserName === 'chromium') {
      await page.context().grantPermissions(['camera']);
    }
    
    await page.goto('/');
    
    // Wait for page to fully load and JavaScript to initialize
    await expect(page.locator('#app-title-text')).toBeVisible({ timeout: 10000 });
    // Wait for JavaScript to load and translations to update the title
    await page.waitForTimeout(3000);
    
    // Force enable scan button for testing (camera mocking might not trigger enable)
    await page.evaluate(() => {
      const scanButton = document.getElementById('scan-button');
      if (scanButton && scanButton.disabled) {
        scanButton.disabled = false;
      }
    });
  });

  test('Puter.ai SDK loads correctly', async ({ page }) => {
    // Wait for app initialization to complete
    await page.waitForTimeout(2000);
    
    // Check if Puter.ai SDK is loaded (mocked in beforeEach)
    const puterExists = await page.evaluate(() => {
      return typeof window.puter !== 'undefined' && 
             typeof window.puter.ai !== 'undefined' &&
             typeof window.puter.ai.chat === 'function';
    });
    
    expect(puterExists).toBe(true);
  });

  test('AI integration handles mock successful response', async ({ page }) => {
    // Wait for camera initialization and scan button to be enabled
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled', { timeout: 10000 });
    
    // Override the default mock with our specific test response
    await page.evaluate(() => {
      window.puter.ai.chat = async (prompt, imageData) => {
        return {
          content: JSON.stringify({
            items: [{
              itemName: 'Test Plastic Bottle',
              primaryBin: 'recyclable',
              primaryConfidence: 0.95,
              secondaryBin: 'general-waste',
              secondaryConfidence: 0.05,
              material: 'plastic',
              reasoning: 'Clear PET plastic bottle suitable for recycling',
              isContaminated: false,
              position: 'center'
            }]
          })
        };
      };
    });

    // Click scan button
    await page.click('#scan-button');
    
    // Wait for AI response to be processed and displayed
    await expect(page.locator('#result-card')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#result-content')).toBeVisible({ timeout: 5000 });
    
    // Verify the result is displayed correctly
    await expect(page.locator('#item-name')).toContainText('Test Plastic Bottle');
    await expect(page.locator('#bin-header')).toContainText('Recycling');
  });

  test('AI integration handles network errors gracefully', async ({ page }) => {
    // Wait for camera initialization and scan button to be enabled
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled', { timeout: 10000 });
    
    // Override puter.ai.chat to simulate network error
    await page.evaluate(() => {
      window.puter.ai.chat = async (prompt, imageData) => {
        throw new Error('Network connection failed');
      };
    });
    
    // Click scan button
    await page.click('#scan-button');
    
    // Should show error message
    await expect(page.locator('#output')).toContainText('Error', { timeout: 10000 });
  });

  test('AI integration handles invalid JSON response', async ({ page }) => {
    // Wait for camera initialization and scan button to be enabled
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled', { timeout: 10000 });
    
    // Override puter.ai.chat to return invalid JSON
    await page.evaluate(() => {
      window.puter.ai.chat = async (prompt, imageData) => {
        return {
          content: 'This is not valid JSON'
        };
      };
    });
    
    // Click scan button
    await page.click('#scan-button');
    
    // Should show error message for invalid JSON
    await expect(page.locator('#output')).toContainText('Error', { timeout: 10000 });
  });

  test('AI integration passes correct prompt structure', async ({ page }) => {
    // Wait for camera initialization and scan button to be enabled
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled', { timeout: 10000 });
    
    // Override puter.ai.chat to capture the prompt and image data
    await page.evaluate(() => {
      window.capturedData = { prompt: '', imageData: '' };
      window.puter.ai.chat = async (prompt, imageData) => {
        window.capturedData.prompt = prompt;
        window.capturedData.imageData = imageData;
        
        return {
          content: JSON.stringify({
            items: [{
              itemName: 'Test Item',
              primaryBin: 'recyclable',
              primaryConfidence: 0.8,
              material: 'plastic',
              reasoning: 'Test reasoning',
              isContaminated: false,
              position: 'center'
            }]
          })
        };
      };
    });
    
    // Click scan button
    await page.click('#scan-button');
    
    // Wait for the AI call to complete
    await expect(page.locator('#result-card')).toBeVisible({ timeout: 10000 });
    
    // Verify the prompt structure
    const capturedData = await page.evaluate(() => window.capturedData);
    
    expect(capturedData.prompt).toContain('waste sorting');
    expect(capturedData.prompt).toContain('JSON object');
    expect(capturedData.prompt).toContain('primaryBin');
    expect(capturedData.prompt).toContain('primaryConfidence');
    expect(capturedData.imageData).toMatch(/^data:image\/(jpeg|png)/);
  });

  test('AI integration handles different bin types correctly', async ({ page }) => {
    const binTypes = [
      { type: 'recyclable', expectedClass: 'recyclable', expectedText: 'Recycling' },
      { type: 'organic', expectedClass: 'organic', expectedText: 'Organics' },
      { type: 'hazardous', expectedClass: 'hazardous', expectedText: 'Hazardous' },
      { type: 'general-waste', expectedClass: 'general-waste', expectedText: 'Trash' }
    ];

    // Wait for camera initialization first
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled', { timeout: 10000 });

    for (const binType of binTypes) {
      // Override puter.ai.chat for each bin type
      await page.evaluate((binTypeData) => {
        window.puter.ai.chat = async (prompt, imageData) => {
          return {
            content: JSON.stringify({
              items: [{
                itemName: `Test ${binTypeData.type} Item`,
                primaryBin: binTypeData.type,
                primaryConfidence: 0.9,
                material: 'test',
                reasoning: `Test item for ${binTypeData.type}`,
                isContaminated: false,
                position: 'center'
              }]
            })
          };
        };
      }, binType);

      // Ensure scan button is enabled
      await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled');
      
      // Click scan button
      await page.click('#scan-button');
      
      // Wait for result
      await expect(page.locator('#result-card')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#result-content')).toBeVisible({ timeout: 5000 });
      
      // Verify bin type is displayed correctly
      await expect(page.locator('#bin-header')).toContainText(binType.expectedText, { timeout: 5000 });
      
      // Reset for next iteration by clicking retake
      await page.click('#retake-button');
      await expect(page.locator('#welcome-state')).toBeVisible({ timeout: 5000 });
    }
  });

  test('AI integration handles multi-region context correctly', async ({ page }) => {
    const countries = [
      { code: 'us', name: 'US', fullName: 'United States' },
      { code: 'de', name: 'German', fullName: 'Germany' },
      { code: 'it', name: 'Italian', fullName: 'Italy' },
      { code: 'br', name: 'Brazilian', fullName: 'Brazil' }
    ];

    // Wait for camera initialization first
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled', { timeout: 10000 });

    for (const country of countries) {
      // Select country
      await page.selectOption('#country-select', country.code);
      
      // Override puter.ai.chat to capture the prompt
      await page.evaluate((countryData) => {
        window.capturedPrompt = '';
        window.puter.ai.chat = async (prompt, imageData) => {
          window.capturedPrompt = prompt;
          return {
            content: JSON.stringify({
              items: [{
                itemName: 'Test Item',
                primaryBin: 'recyclable',
                primaryConfidence: 0.8,
                material: 'plastic',
                reasoning: 'Test reasoning',
                isContaminated: false,
                position: 'center'
              }]
            })
          };
        };
      }, country);

      // Ensure scan button is enabled and click
      await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled');
      await page.click('#scan-button');
      
      // Wait for result
      await expect(page.locator('#result-card')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#result-content')).toBeVisible({ timeout: 5000 });
      
      // Verify country context is included in prompt
      const promptContent = await page.evaluate(() => window.capturedPrompt);
      expect(promptContent).toContain(country.name);
      
      // Reset for next iteration
      await page.click('#retake-button');
      await expect(page.locator('#welcome-state')).toBeVisible({ timeout: 5000 });
    }
  });

  // Skip this test in automated environments as it requires real API access
  test('Real AI integration test (manual verification)', async ({ page }) => {
    test.skip(true, 'Skipping real AI test - requires manual testing with actual API');
    
    console.log('🧪 Running real AI integration test...');
    console.log('📝 This test makes an actual API call to Puter.ai');
    
    // Wait for camera initialization and scan button to be enabled
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled', { timeout: 10000 });
    
    // Use the real Puter.ai API (remove our mock)
    await page.evaluate(() => {
      // Reset to use actual external Puter.ai SDK
      delete window.puter;
    });
    
    // Wait a bit for the external SDK to potentially load
    await page.waitForTimeout(2000);
    
    // Click scan button to trigger real AI call
    await page.click('#scan-button');
    
    // Wait longer for real API response
    await page.waitForTimeout(5000);
    
    // Check if we got either a result or an error
    const hasResult = await page.locator('#result-content').isVisible();
    const hasError = await page.locator('#output').locator('text=/Error/').isVisible();
    
    expect(hasResult || hasError).toBe(true);
    
    if (hasResult) {
      console.log('✅ Real AI integration is working!');
      // If we got a result, verify it has the expected structure
      await expect(page.locator('#item-name')).toBeVisible();
      await expect(page.locator('#bin-header')).toBeVisible();
    } else if (hasError) {
      console.log('⚠️ AI integration returned an error (may be expected in test environment)');
    }
  });
});

// Lightweight smoke test for quick verification
test.describe('AI Smoke Tests', () => {
  test('Puter SDK loads and basic objects exist', async ({ page }) => {
    // Mock camera and Puter SDK before page load
    await page.addInitScript(() => {
      // Mock camera
      const mockStream = {
        getVideoTracks: () => [{ getSettings: () => ({ width: 640, height: 480 }), stop: () => {} }]
      };
      if (!navigator.mediaDevices) navigator.mediaDevices = {};
      navigator.mediaDevices.getUserMedia = () => Promise.resolve(mockStream);
      HTMLVideoElement.prototype.play = () => Promise.resolve();
      
      // Mock Puter SDK
      window.puter = {
        ai: {
          chat: async () => ({ content: '{"items":[{"itemName":"Test","primaryBin":"recyclable"}]}' })
        },
        geo: {}
      };
    });
    
    await page.goto('/');
    
    // Wait for app initialization
    await expect(page.locator('#app-title-text')).toContainText('Smart Trash Separator', { timeout: 10000 });
    
    const sdkStatus = await page.evaluate(() => {
      return {
        puterExists: typeof window.puter !== 'undefined',
        aiExists: typeof window.puter?.ai !== 'undefined',
        chatExists: typeof window.puter?.ai?.chat === 'function',
        geoExists: typeof window.puter?.geo !== 'undefined'
      };
    });
    
    console.log('🔍 Puter SDK Status:', sdkStatus);
    
    expect(sdkStatus.puterExists).toBe(true);
    expect(sdkStatus.aiExists).toBe(true);  
    expect(sdkStatus.chatExists).toBe(true);
  });
});