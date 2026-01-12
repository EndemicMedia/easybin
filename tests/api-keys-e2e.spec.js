/**
 * E2E Test for API Keys Configuration
 * Tests adding OpenRouter and Gemini API keys via UI and making real API requests
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Load API keys from .env file
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

test.describe('API Keys Configuration E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the app
        await page.goto('http://localhost:5050');

        // Wait for app to initialize
        await page.waitForLoadState('networkidle');

        // Clear any existing API keys from localStorage
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('should open API keys modal and display current providers', async ({ page }) => {
        // Find and click the API keys button (key icon in navbar)
        const apiKeysButton = page.locator('#api-keys-button');
        await expect(apiKeysButton).toBeVisible();
        await apiKeysButton.click();

        // Verify modal opens
        const modal = page.locator('#api-keys-modal');
        await expect(modal).toBeVisible();

        // Verify modal title
        await expect(page.locator('#api-keys-modal h2')).toContainText('API Keys');

        // Verify input fields are present
        await expect(page.locator('#openrouter-key')).toBeVisible();
        await expect(page.locator('#google-gemini-key')).toBeVisible();

        // Verify active providers list shows only free providers initially
        const providersList = page.locator('#active-providers-list');
        await expect(providersList).toContainText('2 providers active');
        await expect(providersList).toContainText('pollinations-gemini');
        await expect(providersList).toContainText('pollinations-bidara');
    });

    test('should add OpenRouter API key and enable OpenRouter providers', async ({ page }) => {
        if (!OPENROUTER_API_KEY) {
            test.skip('OPENROUTER_API_KEY not set in .env');
        }

        // Open API keys modal
        await page.locator('#api-keys-button').click();
        await expect(page.locator('#api-keys-modal')).toBeVisible();

        // Enter OpenRouter API key
        await page.locator('#openrouter-key').fill(OPENROUTER_API_KEY);

        // Save keys
        await page.locator('#save-api-keys').click();

        // Wait for success feedback
        await expect(page.locator('#save-api-keys')).toContainText('Saved!');

        // Verify providers list updated to include OpenRouter models
        const providersList = page.locator('#active-providers-list');
        await expect(providersList).toContainText('8 providers active'); // 2 free + 6 OpenRouter
        await expect(providersList).toContainText('openrouter-molmo');
        await expect(providersList).toContainText('Premium');

        // Close modal
        await page.keyboard.press('Escape');
        await expect(page.locator('#api-keys-modal')).not.toBeVisible();

        // Verify keys are persisted in localStorage
        const storedKeys = await page.evaluate(() => {
            return localStorage.getItem('easybin_api_keys');
        });
        expect(storedKeys).toBeTruthy();
        const keys = JSON.parse(storedKeys);
        expect(keys.openrouter).toBe(OPENROUTER_API_KEY);
    });

    test('should add Gemini API key and enable Gemini providers', async ({ page }) => {
        if (!GOOGLE_GEMINI_API_KEY) {
            test.skip('GOOGLE_GEMINI_API_KEY not set in .env');
        }

        // Open API keys modal
        await page.locator('#api-keys-button').click();
        await expect(page.locator('#api-keys-modal')).toBeVisible();

        // Enter Gemini API key
        await page.locator('#google-gemini-key').fill(GOOGLE_GEMINI_API_KEY);

        // Save keys
        await page.locator('#save-api-keys').click();

        // Wait for success feedback
        await expect(page.locator('#save-api-keys')).toContainText('Saved!');

        // Verify providers list updated to include Gemini models
        const providersList = page.locator('#active-providers-list');
        await expect(providersList).toContainText('6 providers active'); // 2 free + 4 Gemini
        await expect(providersList).toContainText('google-gemini-flash-lite');
        await expect(providersList).toContainText('google-gemini-2.5-flash');

        // Close modal
        await page.keyboard.press('Escape');
    });

    test('should add both API keys and enable all providers', async ({ page }) => {
        if (!OPENROUTER_API_KEY || !GOOGLE_GEMINI_API_KEY) {
            test.skip('API keys not set in .env');
        }

        // Open API keys modal
        await page.locator('#api-keys-button').click();
        await expect(page.locator('#api-keys-modal')).toBeVisible();

        // Enter both API keys
        await page.locator('#openrouter-key').fill(OPENROUTER_API_KEY);
        await page.locator('#google-gemini-key').fill(GOOGLE_GEMINI_API_KEY);

        // Save keys
        await page.locator('#save-api-keys').click();

        // Wait for success feedback
        await expect(page.locator('#save-api-keys')).toContainText('Saved!');

        // Verify providers list shows all providers
        const providersList = page.locator('#active-providers-list');
        await expect(providersList).toContainText('12 providers active'); // 2 free + 4 Gemini + 6 OpenRouter
    });

    test('should make a real scan request with Gemini API key', async ({ page }) => {
        if (!GOOGLE_GEMINI_API_KEY) {
            test.skip('GOOGLE_GEMINI_API_KEY not set in .env');
        }

        // Add Gemini API key
        await page.locator('#api-keys-button').click();
        await page.locator('#google-gemini-key').fill(GOOGLE_GEMINI_API_KEY);
        await page.locator('#save-api-keys').click();
        await expect(page.locator('#save-api-keys')).toContainText('Saved!');
        await page.keyboard.press('Escape');

        // Open camera
        await page.locator('#open-camera-button').click();

        // Wait for camera to initialize
        await page.waitForTimeout(2000);

        // Listen for console logs to verify which provider was used
        const consoleMessages = [];
        page.on('console', msg => {
            if (msg.text().includes('[MultiProvider]')) {
                consoleMessages.push(msg.text());
            }
        });

        // Click scan button
        await page.locator('#scan-button').click();

        // Wait for AI response (max 30 seconds)
        await page.waitForSelector('#result-content', {
            state: 'visible',
            timeout: 30000
        });

        // Verify result is displayed
        const resultContent = page.locator('#result-content');
        await expect(resultContent).toBeVisible();

        // Verify a Gemini provider was used (check console logs)
        await page.waitForTimeout(1000);
        const geminiUsed = consoleMessages.some(msg =>
            msg.includes('google-gemini') && msg.includes('succeeded')
        );
        expect(geminiUsed).toBeTruthy();

        // Verify result has item name
        const itemName = page.locator('.item-name');
        await expect(itemName).toBeVisible();
    });

    test('should clear all API keys', async ({ page }) => {
        if (!OPENROUTER_API_KEY) {
            test.skip('OPENROUTER_API_KEY not set in .env');
        }

        // Add API key first
        await page.locator('#api-keys-button').click();
        await page.locator('#openrouter-key').fill(OPENROUTER_API_KEY);
        await page.locator('#save-api-keys').click();
        await expect(page.locator('#save-api-keys')).toContainText('Saved!');

        // Verify providers increased
        await expect(page.locator('#active-providers-list')).toContainText('8 providers active');

        // Click clear button
        page.on('dialog', dialog => dialog.accept()); // Auto-accept confirmation
        await page.locator('#clear-api-keys').click();

        // Verify inputs are cleared
        await expect(page.locator('#openrouter-key')).toHaveValue('');
        await expect(page.locator('#google-gemini-key')).toHaveValue('');

        // Verify providers list back to free only
        await expect(page.locator('#active-providers-list')).toContainText('2 providers active');

        // Verify localStorage is cleared
        const storedKeys = await page.evaluate(() => {
            return localStorage.getItem('easybin_api_keys');
        });
        expect(storedKeys).toBeNull();
    });

    test('should persist API keys across page reloads', async ({ page }) => {
        if (!OPENROUTER_API_KEY) {
            test.skip('OPENROUTER_API_KEY not set in .env');
        }

        // Add API key
        await page.locator('#api-keys-button').click();
        await page.locator('#openrouter-key').fill(OPENROUTER_API_KEY);
        await page.locator('#save-api-keys').click();
        await page.keyboard.press('Escape');

        // Reload page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Open modal again
        await page.locator('#api-keys-button').click();

        // Verify key is still there (masked)
        const openrouterInput = page.locator('#openrouter-key');
        const value = await openrouterInput.inputValue();
        expect(value).toBe(OPENROUTER_API_KEY);

        // Verify providers are still active
        await expect(page.locator('#active-providers-list')).toContainText('8 providers active');
    });

    test('should handle invalid API keys gracefully', async ({ page }) => {
        // Add invalid API key
        await page.locator('#api-keys-button').click();
        await page.locator('#google-gemini-key').fill('invalid-key-12345');
        await page.locator('#save-api-keys').click();
        await page.keyboard.press('Escape');

        // Try to make a scan (will fail but should handle gracefully)
        await page.locator('#open-camera-button').click();
        await page.waitForTimeout(2000);

        // Listen for errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.locator('#scan-button').click();

        // Should eventually show error or fallback to free provider
        await page.waitForTimeout(5000);

        // App should still be functional (not crashed)
        await expect(page.locator('#scan-button')).toBeVisible();
    });
});
