/**
 * Multi-Provider Vision AI Client
 * Manages rotation across multiple vision API providers
 */

// Adapters are loaded from ai-provider-adapters.js and available on window
// No need to import/declare them here

class MultiProviderVisionClient {
    constructor(apiKeyManager = null) {
        this.apiKeyManager = apiKeyManager;

        // Provider configurations in priority order
        this.providers = this.configureProviders();

        // Provider health stats
        this.providerStats = {};
        this.providers.forEach(p => {
            this.providerStats[p.name] = {
                success: 0,
                failed: 0,
                lastFailure: null
            };
        });
    }

    /**
     * Configure providers based on available API keys
     * @returns {Array} Configured providers
     */
    configureProviders() {
        const providers = [
            // Pollinations - free tier with optional API key for better rate limits
            {
                name: 'pollinations-openai',
                endpoint: 'https://gen.pollinations.ai/v1/chat/completions',
                model: 'openai',
                adapter: new window.PollinationsAdapter('openai'),
                maxRetries: 2,
                timeout: 30000,
                requiresAuth: false, // Optional - works without key but has rate limits
                authType: 'bearer' // Use Bearer token when key is available
            },
            {
                name: 'pollinations-gemini',
                endpoint: 'https://gen.pollinations.ai/v1/chat/completions',
                model: 'gemini',
                adapter: new window.PollinationsAdapter('gemini'),
                maxRetries: 2,
                timeout: 30000,
                requiresAuth: false,
                authType: 'bearer'
            }
        ];

        // Add Google Gemini models if API key is available (in speed order)
        if (this.apiKeyManager && this.apiKeyManager.hasKey('google')) {
            const geminiModels = [
                { id: 'gemini-flash-lite-latest', name: 'flash-lite', timeout: 10000, speed: '1.6s' },
                { id: 'gemini-2.5-flash-lite', name: '2.5-flash-lite', timeout: 12000, speed: '2.3s' },
                { id: 'gemini-flash-latest', name: 'flash', timeout: 15000, speed: '3.2s' },
                { id: 'gemini-2.5-flash', name: '2.5-flash', timeout: 20000, speed: '4.8s' }
            ];

            geminiModels.forEach(model => {
                providers.push({
                    name: `google-gemini-${model.name}`,
                    endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent`,
                    model: `models/${model.id}`,
                    adapter: new window.GeminiAdapter(`models/${model.id}`),
                    maxRetries: 2,
                    timeout: model.timeout,
                    requiresAuth: true,
                    authType: 'query'
                });
            });

            console.log(`[MultiProvider] Added ${geminiModels.length} Google Gemini models (fastest to slowest)`);
        }

        // Add OpenRouter providers if API key is available
        if (this.apiKeyManager && this.apiKeyManager.hasKey('openrouter')) {
            const openRouterModels = [
                { id: 'allenai/molmo-2-8b:free', name: 'molmo-2-8b', timeout: 30000 },
                { id: 'google/gemma-3-12b-it:free', name: 'gemma-3-12b', timeout: 35000 },
                { id: 'google/gemma-3-4b-it:free', name: 'gemma-3-4b', timeout: 30000 },
                { id: 'qwen/qwen-2.5-vl-7b-instruct:free', name: 'qwen-vl-7b', timeout: 35000 },
                { id: 'nvidia/nemotron-nano-12b-v2-vl:free', name: 'nemotron-12b', timeout: 35000 },
                { id: 'google/gemma-3-27b-it:free', name: 'gemma-3-27b', timeout: 35000 }
            ];

            openRouterModels.forEach(model => {
                providers.push({
                    name: `openrouter-${model.name}`,
                    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
                    model: model.id,
                    adapter: new window.OpenRouterAdapter(model.id),
                    maxRetries: 2,
                    timeout: model.timeout,
                    requiresAuth: true,
                    authType: 'bearer'
                });
            });

            console.log(`[MultiProvider] Added ${openRouterModels.length} OpenRouter models`);
        }

        return providers;
    }

    getProviders() {
        return this.providers;
    }

    getProviderStats() {
        return this.providerStats;
    }

    /**
     * Analyze an image using multi-provider rotation
     * @param {string} prompt - The analysis prompt
     * @param {string} imageData - Base64 encoded image data
     * @returns {Promise<Object>} - Analysis result
     */
    async analyze(prompt, imageData) {
        const attemptedProviders = [];
        let lastError = null;

        // Try each provider in order
        for (const provider of this.providers) {
            console.log(`[MultiProvider] Trying ${provider.name}...`);

            // Try with retries
            for (let attempt = 0; attempt <= provider.maxRetries; attempt++) {
                try {
                    const startTime = Date.now();

                    // Format request using provider's adapter
                    const requestPayload = provider.adapter.formatRequest(prompt, imageData);

                    // Prepare headers and URL
                    const headers = {
                        'Content-Type': 'application/json'
                    };

                    let fetchUrl = provider.endpoint;

                    // Add Authorization based on provider type
                    if (provider.requiresAuth || provider.name.includes('pollinations')) {
                        let apiKey = null;

                        // Get API key based on provider
                        if (provider.name.includes('google')) {
                            apiKey = this.apiKeyManager?.getKey('google');
                        } else if (provider.name.includes('openrouter')) {
                            apiKey = this.apiKeyManager?.getKey('openrouter');
                        } else if (provider.name.includes('pollinations')) {
                            apiKey = this.apiKeyManager?.getKey('pollinations');
                        }

                        // Add auth header if key is available
                        if (apiKey) {
                            if (provider.authType === 'bearer') {
                                headers['Authorization'] = `Bearer ${apiKey}`;
                            } else if (provider.authType === 'query') {
                                // For query param auth (like Gemini), add to URL
                                fetchUrl += `?key=${apiKey}`;
                            }

                            // Make API call
                            const response = await fetch(fetchUrl, {
                                method: 'POST',
                                headers: headers,
                                body: JSON.stringify(requestPayload),
                                signal: AbortSignal.timeout(provider.timeout)
                            });

                            const responseTime = Date.now() - startTime;

                            // Handle rate limiting
                            if (response.status === 429) {
                                console.log(`[MultiProvider] ${provider.name} rate limited (429), moving to next provider`);
                                this.providerStats[provider.name].failed++;
                                this.providerStats[provider.name].lastFailure = Date.now();
                                break; // Skip to next provider immediately on rate limit
                            }

                            // Handle other errors
                            if (!response.ok) {
                                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                            }

                            // Parse response
                            const data = await response.json();
                            const parsed = provider.adapter.parseResponse(data);

                            // Success!
                            this.providerStats[provider.name].success++;
                            console.log(`[MultiProvider] ✅ ${provider.name} succeeded in ${responseTime}ms`);

                            return {
                                content: parsed.content,
                                provider: provider.name,
                                timestamp: new Date().toISOString(),
                                responseTime: responseTime,
                                attempt: attempt + 1
                            };

                        } catch (error) {
                            lastError = error;
                            this.providerStats[provider.name].failed++;
                            this.providerStats[provider.name].lastFailure = Date.now();

                            console.warn(`[MultiProvider] ${provider.name} attempt ${attempt + 1}/${provider.maxRetries + 1} failed:`, error.message);

                            // If this was the last retry for this provider, move to next provider
                            if (attempt === provider.maxRetries) {
                                attemptedProviders.push(provider.name);
                                break;
                            }

                            // Wait before retry (exponential backoff)
                            const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }
                    }
                }

        // All providers failed
        const error = new Error(
                    `All vision providers failed after trying: ${attemptedProviders.join(', ')}. Last error: ${lastError?.message || 'Unknown'}`
                );
                error.attemptedProviders = attemptedProviders;
                error.originalError = lastError;
                throw error;
            }
        }

        // Export for Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = { MultiProviderVisionClient };
        }
