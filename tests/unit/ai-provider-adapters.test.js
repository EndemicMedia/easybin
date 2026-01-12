/**
 * Unit Tests for Provider Adapters
 * Tests the format conversion for each provider
 */

describe('Provider Adapters', () => {
    const {
        PollinationsAdapter,
        HuggingFaceAdapter,
        JinaAdapter,
        OpenRouterAdapter,
        GeminiAdapter
    } = require('../../src/js/ai-provider-adapters');

    beforeEach(() => {
        // The adapters are now directly imported
    });

    describe('PollinationsAdapter', () => {
        test('should format request for Pollinations API', () => {
            const adapter = new PollinationsAdapter('gemini');
            const request = adapter.formatRequest('test prompt', 'base64image');

            expect(request.model).toBe('gemini');
            expect(request.messages).toBeDefined();
            expect(request.messages[0].role).toBe('user');
            expect(request.messages[0].content).toHaveLength(2);
            expect(request.messages[0].content[0].type).toBe('text');
            expect(request.messages[0].content[1].type).toBe('image_url');
        });

        test('should parse Pollinations response', () => {
            const adapter = new adapters.PollinationsAdapter('gemini');
            const apiResponse = {
                choices: [{ message: { content: '{"items":[{"itemName":"bottle"}]}' } }]
            };

            const parsed = adapter.parseResponse(apiResponse);

            expect(parsed).toHaveProperty('content');
            expect(parsed.content).toContain('bottle');
        });

        test('should handle markdown-wrapped JSON', () => {
            const adapter = new adapters.PollinationsAdapter('gemini');
            const apiResponse = {
                choices: [{ message: { content: '```json\n{"items":[]}\n```' } }]
            };

            const parsed = adapter.parseResponse(apiResponse);

            expect(parsed.content).toContain('items');
        });

        test('should work with both gemini and bidara models', () => {
            const geminiAdapter = new adapters.PollinationsAdapter('gemini');
            const bidaraAdapter = new adapters.PollinationsAdapter('bidara');

            expect(geminiAdapter.formatRequest('test', 'img').model).toBe('gemini');
            expect(bidaraAdapter.formatRequest('test', 'img').model).toBe('bidara');
        });
    });

    describe('HuggingFaceAdapter', () => {
        test('should format request for Hugging Face Inference API', () => {
            const adapter = new adapters.HuggingFaceAdapter('vikhyatk/moondream2');
            const request = adapter.formatRequest('test prompt', 'base64image');

            expect(request.inputs).toBeDefined();
            expect(request.parameters).toBeDefined();
        });

        test('should include image in correct format', () => {
            const adapter = new adapters.HuggingFaceAdapter('vikhyatk/moondream2');
            const request = adapter.formatRequest('identify this', 'abc123base64');

            // Hugging Face expects image as part of inputs
            expect(request.inputs.image).toBeDefined();
            expect(request.inputs.text).toContain('identify');
        });

        test('should parse Hugging Face response', () => {
            const adapter = new adapters.HuggingFaceAdapter('vikhyatk/moondream2');
            const apiResponse = [{ generated_text: 'A plastic bottle' }];

            const parsed = adapter.parseResponse(apiResponse);

            expect(parsed).toHaveProperty('content');
            expect(parsed.content).toContain('bottle');
        });

        test('should handle Hugging Face error responses', () => {
            const adapter = new adapters.HuggingFaceAdapter('vikhyatk/moondream2');
            const errorResponse = { error: 'Model too busy' };

            expect(() => adapter.parseResponse(errorResponse)).toThrow();
        });
    });

    describe('JinaAdapter', () => {
        test('should format request for Jina Reader API', () => {
            const adapter = new adapters.JinaAdapter();
            const request = adapter.formatRequest('describe this image', 'base64image');

            // Jina uses simple POST with image
            expect(request).toHaveProperty('image');
            expect(request).toHaveProperty('prompt');
        });

        test('should handle base64 images', () => {
            const adapter = new adapters.JinaAdapter();
            const request = adapter.formatRequest('test', 'data:image/jpeg;base64,abc123');

            expect(request.image).toContain('abc123');
        });

        test('should parse Jina response', () => {
            const adapter = new adapters.JinaAdapter();
            const apiResponse = {
                caption: 'A reusable water bottle on a table'
            };

            const parsed = adapter.parseResponse(apiResponse);

            expect(parsed).toHaveProperty('content');
            expect(parsed.content).toContain('bottle');
        });

        test('should convert caption to waste analysis format', () => {
            const adapter = new adapters.JinaAdapter();
            const apiResponse = {
                caption: 'plastic bottle'
            };

            const parsed = adapter.parseResponse(apiResponse);

            // Jina only does captions, so we need to wrap in a basic format
            expect(parsed.content).toBeDefined();
            expect(typeof parsed.content).toBe('string');
        });
    });

    describe('Adapter Error Handling', () => {
        test('all adapters should handle malformed responses', () => {
            const pollinations = new adapters.PollinationsAdapter('gemini');
            const huggingface = new adapters.HuggingFaceAdapter('moondream2');
            const jina = new adapters.JinaAdapter();

            expect(() => pollinations.parseResponse(null)).toThrow();
            expect(() => huggingface.parseResponse(null)).toThrow();
            expect(() => jina.parseResponse(null)).toThrow();
        });

        test('all adapters should validate input parameters', () => {
            const pollinations = new adapters.PollinationsAdapter('gemini');
            const huggingface = new adapters.HuggingFaceAdapter('moondream2');
            const jina = new adapters.JinaAdapter();

            expect(() => pollinations.formatRequest()).toThrow();
            expect(() => huggingface.formatRequest()).toThrow();
            expect(() => jina.formatRequest()).toThrow();
        });
    });

    describe('Adapter Interface Consistency', () => {
        test('all adapters should have formatRequest method', () => {
            const pollinations = new adapters.PollinationsAdapter('gemini');
            const huggingface = new adapters.HuggingFaceAdapter('moondream2');
            const jina = new adapters.JinaAdapter();

            expect(typeof pollinations.formatRequest).toBe('function');
            expect(typeof huggingface.formatRequest).toBe('function');
            expect(typeof jina.formatRequest).toBe('function');
        });

        test('all adapters should have parseResponse method', () => {
            const pollinations = new adapters.PollinationsAdapter('gemini');
            const huggingface = new adapters.HuggingFaceAdapter('moondream2');
            const jina = new adapters.JinaAdapter();

            expect(typeof pollinations.parseResponse).toBe('function');
            expect(typeof huggingface.parseResponse).toBe('function');
            expect(typeof jina.parseResponse).toBe('function');
        });

        test('all adapters should return consistent response format', () => {
            const pollinations = new adapters.PollinationsAdapter('gemini');
            const huggingface = new adapters.HuggingFaceAdapter('moondream2');
            const jina = new adapters.JinaAdapter();

            const pollinationsResp = pollinations.parseResponse({
                choices: [{ message: { content: 'test' } }]
            });
            const huggingfaceResp = huggingface.parseResponse([{ generated_text: 'test' }]);
            const jinaResp = jina.parseResponse({ caption: 'test' });

            [pollinationsResp, huggingfaceResp, jinaResp].forEach(resp => {
                expect(resp).toHaveProperty('content');
                expect(typeof resp.content).toBe('string');
            });
        });
    });
});
