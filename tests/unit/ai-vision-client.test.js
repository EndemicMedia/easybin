/**
 * Unit Tests for Multi-Provider Vision API Client
 * Tests the rotation logic and provider management
 */

describe('MultiProviderVisionClient', () => {
    let client;

    beforeEach(() => {
        // Will be implemented after tests are defined
        const { MultiProviderVisionClient } = require('../ai-vision-client');
        client = new MultiProviderVisionClient();
    });

    describe('Provider Configuration', () => {
        test('should have multiple providers configured', () => {
            const providers = client.getProviders();
            expect(providers.length).toBeGreaterThan(1);
            expect(providers).toContainEqual(
                expect.objectContaining({ name: 'pollinations-gemini' })
            );
            expect(providers).toContainEqual(
                expect.objectContaining({ name: 'pollinations-bidara' })
            );
        });

        test('should order providers by priority', () => {
            const providers = client.getProviders();
            expect(providers[0].name).toBe('pollinations-gemini');
            expect(providers[1].name).toBe('pollinations-bidara');
        });

        test('should have required fields for each provider', () => {
            const providers = client.getProviders();
            providers.forEach(provider => {
                expect(provider).toHaveProperty('name');
                expect(provider).toHaveProperty('endpoint');
                expect(provider).toHaveProperty('maxRetries');
                expect(provider).toHaveProperty('timeout');
                expect(provider).toHaveProperty('adapter');
            });
        });
    });

    describe('Provider Rotation', () => {
        test('should try primary provider first', async () => {
            const mockFetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ choices: [{ message: { content: 'test' } }] })
            });
            global.fetch = mockFetch;

            await client.analyze('test prompt', 'base64image');

            const firstCall = mockFetch.mock.calls[0];
            expect(firstCall[0]).toContain('text.pollinations.ai');
        });

        test('should fallback to secondary provider on primary failure', async () => {
            const mockFetch = jest.fn()
                .mockRejectedValueOnce(new Error('Primary failed'))
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ choices: [{ message: { content: 'test' } }] })
                });
            global.fetch = mockFetch;

            const result = await client.analyze('test prompt', 'base64image');

            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(result.provider).not.toBe('pollinations-gemini');
        });

        test('should try all providers before final failure', async () => {
            const mockFetch = jest.fn().mockRejectedValue(new Error('All failed'));
            global.fetch = mockFetch;

            await expect(client.analyze('test prompt', 'base64image')).rejects.toThrow();

            // Should have tried all providers with their max retries
            const totalAttempts = client.getProviders().reduce(
                (sum, p) => sum + (p.maxRetries + 1), 0
            );
            expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(totalAttempts);
        });

        test('should respect retry count per provider', async () => {
            const mockFetch = jest.fn().mockRejectedValue(new Error('Failed'));
            global.fetch = mockFetch;

            await expect(client.analyze('test prompt', 'base64image')).rejects.toThrow();

            // Each provider should retry maxRetries times
            const provider = client.getProviders()[0];
            const expectedAttempts = provider.maxRetries + 1;

            // At least first provider should have been tried maxRetries + 1 times
            const firstProviderAttempts = mockFetch.mock.calls.filter(
                call => call[1]?.body?.includes(provider.model || provider.name)
            ).length;
            expect(firstProviderAttempts).toBeGreaterThanOrEqual(expectedAttempts);
        });
    });

    describe('Rate Limit Handling', () => {
        test('should skip to next provider on 429 rate limit', async () => {
            const mockFetch = jest.fn()
                .mockResolvedValueOnce({ status: 429, ok: false })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ choices: [{ message: { content: 'test' } }] })
                });
            global.fetch = mockFetch;

            const result = await client.analyze('test prompt', 'base64image');

            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(result.provider).not.toBe('pollinations-gemini');
        });

        test('should wait before retrying on rate limit', async () => {
            jest.useFakeTimers();
            const mockFetch = jest.fn()
                .mockResolvedValueOnce({ status: 429, ok: false, headers: new Map() })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ choices: [{ message: { content: 'test' } }] })
                });
            global.fetch = mockFetch;

            const promise = client.analyze('test prompt', 'base64image');

            // Fast-forward time
            jest.advanceTimersByTime(3000);

            await promise;
            jest.useRealTimers();
        });
    });

    describe('Health Tracking', () => {
        test('should track successful requests per provider', async () => {
            const mockFetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ choices: [{ message: { content: 'test' } }] })
            });
            global.fetch = mockFetch;

            await client.analyze('test prompt', 'base64image');

            const stats = client.getProviderStats();
            expect(stats['pollinations-gemini'].success).toBeGreaterThan(0);
        });

        test('should track failed requests per provider', async () => {
            const mockFetch = jest.fn().mockRejectedValue(new Error('Failed'));
            global.fetch = mockFetch;

            await expect(client.analyze('test prompt', 'base64image')).rejects.toThrow();

            const stats = client.getProviderStats();
            const totalFailures = Object.values(stats).reduce((sum, s) => sum + s.failed, 0);
            expect(totalFailures).toBeGreaterThan(0);
        });

        test('should record last failure timestamp', async () => {
            const mockFetch = jest.fn().mockRejectedValue(new Error('Failed'));
            global.fetch = mockFetch;
            const beforeTest = Date.now();

            await expect(client.analyze('test prompt', 'base64image')).rejects.toThrow();

            const stats = client.getProviderStats();
            const hasRecentFailure = Object.values(stats).some(
                s => s.lastFailure && s.lastFailure >= beforeTest
            );
            expect(hasRecentFailure).toBe(true);
        });
    });

    describe('Response Normalization', () => {
        test('should normalize successful response', async () => {
            const mockFetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    choices: [{ message: { content: '{"items":[{"itemName":"test"}]}' } }]
                })
            });
            global.fetch = mockFetch;

            const result = await client.analyze('test prompt', 'base64image');

            expect(result).toHaveProperty('content');
            expect(result).toHaveProperty('provider');
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('responseTime');
        });

        test('should include provider name in response', async () => {
            const mockFetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    choices: [{ message: { content: 'test' } }]
                })
            });
            global.fetch = mockFetch;

            const result = await client.analyze('test prompt', 'base64image');

            expect(result.provider).toBeDefined();
            expect(typeof result.provider).toBe('string');
        });
    });

    describe('Error Handling', () => {
        test('should throw descriptive error after all providers fail', async () => {
            const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
            global.fetch = mockFetch;

            await expect(client.analyze('test prompt', 'base64image'))
                .rejects
                .toThrow(/all providers/i);
        });

        test('should include attempted providers in error', async () => {
            const mockFetch = jest.fn().mockRejectedValue(new Error('Failed'));
            global.fetch = mockFetch;

            try {
                await client.analyze('test prompt', 'base64image');
            } catch (error) {
                expect(error.message).toContain('provider');
                expect(error.attemptedProviders).toBeDefined();
            }
        });
    });
});
