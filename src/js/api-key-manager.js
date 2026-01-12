/**
 * API Key Manager
 * Manages user API keys in browser localStorage
 */

class APIKeyManager {
    constructor() {
        this.storageKey = 'easybin_api_keys';
        this.keys = this.loadKeys();
    }

    /**
     * Load API keys from localStorage
     * @returns {Object} Stored API keys
     */
    loadKeys() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Failed to load API keys:', error);
            return {};
        }
    }

    /**
     * Save API keys to localStorage
     * @param {Object} keys - Keys to save
     */
    saveKeys(keys) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(keys));
            this.keys = keys;
            console.log('API keys saved successfully');
        } catch (error) {
            console.error('Failed to save API keys:', error);
        }
    }

    /**
     * Get API key for a specific provider
     * @param {string} provider - Provider name (e.g., 'openrouter', 'google', 'huggingface')
     * @returns {string|null} API key or null if not found
     */
    getKey(provider) {
        return this.keys[provider] || null;
    }

    /**
     * Set API key for a provider
     * @param {string} provider - Provider name
     * @param {string} key - API key
     */
    setKey(provider, key) {
        this.keys[provider] = key.trim();
        this.saveKeys(this.keys);
    }

    /**
     * Remove API key for a provider
     * @param {string} provider - Provider name
     */
    removeKey(provider) {
        delete this.keys[provider];
        this.saveKeys(this.keys);
    }

    /**
     * Clear all API keys
     */
    clearAll() {
        this.keys = {};
        try {
            localStorage.removeItem(this.storageKey);
            console.log('All API keys cleared');
        } catch (error) {
            console.error('Failed to clear API keys:', error);
        }
    }

    /**
     * Check if a provider has an API key configured
     * @param {string} provider - Provider name
     * @returns {boolean}
     */
    hasKey(provider) {
        return !!this.getKey(provider);
    }

    /**
     * Get all configured providers
     * @returns {string[]} List of provider names with keys
     */
    getConfiguredProviders() {
        return Object.keys(this.keys).filter(key => this.keys[key]);
    }
}

// Export for browser usage
if (typeof window !== 'undefined') {
    window.APIKeyManager = APIKeyManager;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIKeyManager;
}
