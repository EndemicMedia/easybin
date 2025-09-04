// E2E Tests for EasyBin using Playwright
// Note: These are Playwright tests, not Jest tests
// Run with: npx playwright test

const { test, expect } = require('@playwright/test');

test.describe('EasyBin E2E Tests', () => {
  test.beforeEach(async ({ page, browserName }) => {
    // Grant camera permissions (only supported in Chromium)
    try {
      if (browserName === 'chromium') {
        await page.context().grantPermissions(['camera'], { origin: 'http://localhost:5050' });
      }
    } catch (error) {
      console.log(`Camera permission not supported in ${browserName}: ${error.message}`);
    }
    await page.goto('http://localhost:5050');
  });

  test('loads homepage correctly', async ({ page }) => {
    // Wait for JavaScript to load and populate the title
    await expect(page.locator('#app-title-text')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Check essential UI elements are visible
    await expect(page.locator('#scan-button')).toBeVisible();
    await expect(page.locator('#open-camera-button')).toBeVisible();
    
    // Camera should be hidden initially (manual initialization)
    await expect(page.locator('#camera')).toHaveClass(/hidden/);
    
    // Scan button should be disabled initially
    await expect(page.locator('#scan-button')).toHaveAttribute('disabled');
  });

  test('language switching works', async ({ page }) => {
    // Wait for page to load first
    await expect(page.locator('#app-title-text')).toBeVisible();
    await page.waitForTimeout(1000);
    
    // Switch to German
    await page.selectOption('#language-select', 'de');
    
    // Check that app title changes to German
    await expect(page.locator('#app-title-text')).toContainText('Intelligenter Müllsortierer');
    
    // Check that button text changes to German
    await expect(page.locator('#scan-button-text')).toContainText('Gegenstand erkennen');
  });

  test('country switching works', async ({ page }) => {
    // Wait for page to load first
    await expect(page.locator('#app-title-text')).toBeVisible();
    await page.waitForTimeout(1000);
    
    // Switch to Germany
    await page.selectOption('#country-select', 'de');
    
    // The selection should be persisted
    const selectedValue = await page.locator('#country-select').inputValue();
    expect(selectedValue).toBe('de');
  });

  test('history modal opens and closes', async ({ page }) => {
    // Wait for page to load first
    await expect(page.locator('#app-title-text')).toBeVisible();
    await page.waitForTimeout(1000);
    
    // Verify modal starts hidden
    await expect(page.locator('#history-modal')).toHaveClass(/hidden/);
    
    // Open history
    await page.click('#history-button');
    
    // Wait for modal to have 'flex' class and not have 'hidden' class
    await expect(page.locator('#history-modal')).toHaveClass(/flex/);
    await expect(page.locator('#history-modal')).not.toHaveClass(/hidden/);
    
    // Close by clicking the close button (more reliable than background click)
    await page.click('#history-modal button');
    
    // Wait for modal to become hidden again and not have flex
    await expect(page.locator('#history-modal')).toHaveClass(/hidden/);
    await expect(page.locator('#history-modal')).not.toHaveClass(/flex/);
  });

  test('camera initialization workflow works', async ({ page, browserName }) => {
    // Wait for page to load first
    await expect(page.locator('#app-title-text')).toContainText('Smart Trash Separator');
    
    // Skip camera tests for browsers that don't support camera permissions
    if (browserName !== 'chromium') {
      console.log(`Skipping camera test for ${browserName} - camera access not available`);
      return;
    }
    
    // Initial state: camera hidden, scan disabled, open camera visible
    await expect(page.locator('#camera')).toHaveClass(/hidden/);
    await expect(page.locator('#scan-button')).toHaveAttribute('disabled');
    await expect(page.locator('#open-camera-button')).toBeVisible();
    
    // Click Open Camera button
    await page.click('#open-camera-button');
    
    // Wait for camera initialization (up to 10 seconds)
    await page.waitForTimeout(8000);
    
    // Camera should now be visible and scan button enabled
    await expect(page.locator('#camera')).not.toHaveClass(/hidden/);
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled');
    
    console.log('✅ Camera initialization workflow completed');
  });

  test('fallback AI system works after camera setup', async ({ page, browserName }) => {
    // Wait for page to load first
    await expect(page.locator('#app-title-text')).toContainText('Smart Trash Separator');
    
    // Skip camera tests for browsers that don't support camera permissions
    if (browserName !== 'chromium') {
      console.log(`Skipping camera test for ${browserName} - camera access not available`);
      return;
    }
    
    const messages = [];
    page.on('console', msg => {
      messages.push(msg.text());
    });
    
    // Initialize camera first
    await page.click('#open-camera-button');
    await page.waitForTimeout(8000); // Wait for camera setup
    
    // Verify camera is ready
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled');
    
    // Click scan - should use fallback AI
    await page.click('#scan-button');
    await page.waitForTimeout(5000); // Wait for AI processing
    
    // Should see fallback AI results
    await expect(page.locator('#item-name')).toContainText('Detected Item');
    
    console.log('✅ Fallback AI system working after camera setup');
  });
});
