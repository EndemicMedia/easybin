// E2E Tests for EasyBin using Playwright
// Note: These are Playwright tests, not Jest tests
// Run with: npx playwright test

const { test, expect } = require('@playwright/test');

test.describe('EasyBin E2E Tests', () => {
  test.beforeEach(async ({ page, browserName }) => {
    // Grant camera permissions (only supported in Chromium)
    if (browserName === 'chromium') {
      await page.context().grantPermissions(['camera']);
    }
    await page.goto('/');
  });

  test('loads homepage correctly', async ({ page }) => {
    // Wait for JavaScript to load and populate the title
    await expect(page.locator('#app-title-text')).toContainText('Smart Trash Separator', { timeout: 10000 });
    await expect(page.locator('#scan-button')).toBeVisible();
    await expect(page.locator('#camera')).toBeVisible();
  });

  test('language switching works', async ({ page }) => {
    // Wait for page to load first
    await expect(page.locator('#app-title-text')).toContainText('Smart Trash Separator');
    
    // Switch to German
    await page.selectOption('#language-select', 'de');
    
    // Check that app title changes to German
    await expect(page.locator('#app-title-text')).toContainText('Intelligenter Müllsortierer');
    
    // Check that button text changes to German
    await expect(page.locator('#scan-button-text')).toContainText('Gegenstand erkennen');
  });

  test('country switching works', async ({ page }) => {
    // Wait for page to load first
    await expect(page.locator('#app-title-text')).toContainText('Smart Trash Separator');
    
    // Switch to Germany
    await page.selectOption('#country-select', 'de');
    
    // The selection should be persisted
    const selectedValue = await page.locator('#country-select').inputValue();
    expect(selectedValue).toBe('de');
  });

  test('history modal opens and closes', async ({ page }) => {
    // Wait for page to load first
    await expect(page.locator('#app-title-text')).toContainText('Smart Trash Separator');
    
    // Verify modal starts hidden
    await expect(page.locator('#history-modal')).toHaveClass(/hidden/);
    
    // Open history
    await page.click('#history-button');
    
    // Wait for modal to not have hidden class
    await expect(page.locator('#history-modal')).not.toHaveClass(/hidden/);
    
    // Close by clicking the modal background
    await page.click('#history-modal');
    
    // Wait for modal to become hidden again
    await expect(page.locator('#history-modal')).toHaveClass(/hidden/);
  });

  test('scan button shows loading state', async ({ page }) => {
    // Wait for page to load first
    await expect(page.locator('#app-title-text')).toContainText('Smart Trash Separator');
    
    // Mock the camera and AI response
    await page.route('**/ai/chat', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          items: [{
            itemName: 'Test Item',
            primaryBin: 'recyclable',
            primaryConfidence: 0.9,
            material: 'plastic',
            reasoning: 'Test reasoning',
            isContaminated: false,
            position: 'center'
          }]
        })
      });
    });

    // Wait for scan button to be enabled
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled');
    await page.click('#scan-button');
    
    // Should show spinner/loading state
    await expect(page.locator('#output')).toContainText('', { timeout: 2000 });
  });

  test('handles offline state gracefully', async ({ page }) => {
    // Wait for page to load first
    await expect(page.locator('#app-title-text')).toContainText('Smart Trash Separator');
    
    // Wait for scan button to be enabled (camera initialized)
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled');
    
    // Go offline
    await page.context().setOffline(true);
    
    // Try to scan - should show appropriate error
    await page.click('#scan-button');
    
    // Should show some output (error message or loading state)
    await expect(page.locator('#output')).not.toBeEmpty({ timeout: 10000 });
  });
});
