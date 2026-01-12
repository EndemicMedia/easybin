// Unit Tests for AI Response Parser
// Tests the parsing and validation logic without calling actual API

const {
    parseAIResponse,
    validateItem,
    isValidBinType,
    createMockAIResponse
} = require('./helpers');

describe('AI Response Parser', () => {

    describe('parseAIResponse', () => {

        test('should parse valid response successfully', () => {
            const response = JSON.stringify({
                items: [{
                    itemName: "Plastic Water Bottle",
                    primaryBin: "recyclable",
                    primaryConfidence: 0.95,
                    material: "PET plastic",
                    reasoning: "Clear plastic bottle with recycling symbol",
                    isContaminated: false,
                    position: "center"
                }]
            });

            const result = parseAIResponse(response);

            expect(result.items).toHaveLength(1);
            expect(result.items[0].itemName).toBe("Plastic Water Bottle");
            expect(result.items[0].primaryBin).toBe("recyclable");
            expect(result.items[0].primaryConfidence).toBe(0.95);
        });

        test('should parse response with multiple items', () => {
            const response = JSON.stringify({
                items: [
                    {
                        itemName: "Plastic Bottle",
                        primaryBin: "recyclable",
                        primaryConfidence: 0.9
                    },
                    {
                        itemName: "Apple Core",
                        primaryBin: "organic",
                        primaryConfidence: 0.85
                    }
                ]
            });

            const result = parseAIResponse(response);
            expect(result.items).toHaveLength(2);
            expect(result.items[0].primaryBin).toBe("recyclable");
            expect(result.items[1].primaryBin).toBe("organic");
        });

        test('should extract JSON from markdown code blocks', () => {
            const response = '```json\n{"items": [{"itemName": "Test", "primaryBin": "recyclable", "primaryConfidence": 0.8}]}\n```';

            const result = parseAIResponse(response);
            expect(result.items).toHaveLength(1);
            expect(result.items[0].primaryBin).toBe("recyclable");
        });

        test('should reject malformed JSON', () => {
            expect(() => parseAIResponse("not json {")).toThrow(/Failed to parse/);
        });

        test('should reject missing items array', () => {
            const response = JSON.stringify({ data: "no items" });
            expect(() => parseAIResponse(response)).toThrow(/missing items array/);
        });

        test('should reject empty items array', () => {
            const response = JSON.stringify({ items: null });
            expect(() => parseAIResponse(response)).toThrow(/missing items array/);
        });
    });

    describe('validateItem', () => {

        test('should validate valid item', () => {
            const item = {
                itemName: "Test Item",
                primaryBin: "recyclable",
                primaryConfidence: 0.9
            };

            expect(() => validateItem(item, 0)).not.toThrow();
        });

        test('should reject invalid bin type', () => {
            const item = {
                itemName: "Test",
                primaryBin: "invalid-bin-type",
                primaryConfidence: 0.8
            };

            expect(() => validateItem(item, 0)).toThrow(/Invalid primaryBin/);
        });

        test('should reject missing primaryBin', () => {
            const item = {
                itemName: "Test",
                primaryConfidence: 0.8
            };

            expect(() => validateItem(item, 0)).toThrow(/Missing primaryBin/);
        });

        test('should reject missing primaryConfidence for non-error items', () => {
            const item = {
                itemName: "Test",
                primaryBin: "recyclable"
            };

            expect(() => validateItem(item, 0)).toThrow(/Invalid or missing primaryConfidence/);
        });

        test('should reject confidence score > 1.0', () => {
            const item = {
                itemName: "Test",
                primaryBin: "recyclable",
                primaryConfidence: 1.5
            };

            expect(() => validateItem(item, 0)).toThrow(/Invalid primaryConfidence/);
        });

        test('should reject confidence score < 0', () => {
            const item = {
                itemName: "Test",
                primaryBin: "recyclable",
                primaryConfidence: -0.1
            };

            expect(() => validateItem(item, 0)).toThrow(/Invalid primaryConfidence/);
        });

        test('should reject invalid secondaryConfidence', () => {
            const item = {
                itemName: "Test",
                primaryBin: "recyclable",
                primaryConfidence: 0.9,
                secondaryConfidence: 1.2
            };

            expect(() => validateItem(item, 0)).toThrow(/Invalid secondaryConfidence/);
        });

        test('should accept valid secondaryConfidence', () => {
            const item = {
                itemName: "Test",
                primaryBin: "recyclable",
                primaryConfidence: 0.9,
                secondaryBin: "organic",
                secondaryConfidence: 0.05
            };

            expect(() => validateItem(item, 0)).not.toThrow();
        });

        test('should accept null secondaryConfidence', () => {
            const item = {
                itemName: "Test",
                primaryBin: "recyclable",
                primaryConfidence: 0.9,
                secondaryConfidence: null
            };

            expect(() => validateItem(item, 0)).not.toThrow();
        });

        test('should reject missing itemName', () => {
            const item = {
                primaryBin: "recyclable",
                primaryConfidence: 0.9
            };

            expect(() => validateItem(item, 0)).toThrow(/Invalid or missing itemName/);
        });

        test('should accept error responses without confidence', () => {
            const item = {
                itemName: "Unable to identify",
                primaryBin: "error",
                reasoning: "Image too blurry"
            };

            expect(() => validateItem(item, 0)).not.toThrow();
        });
    });

    describe('isValidBinType', () => {

        test('should accept valid bin types', () => {
            expect(isValidBinType('recyclable')).toBe(true);
            expect(isValidBinType('organic')).toBe(true);
            expect(isValidBinType('general-waste')).toBe(true);
            expect(isValidBinType('hazardous')).toBe(true);
            expect(isValidBinType('error')).toBe(true);
        });

        test('should reject invalid bin types', () => {
            expect(isValidBinType('invalid')).toBe(false);
            expect(isValidBinType('trash')).toBe(false);
            expect(isValidBinType('')).toBe(false);
            expect(isValidBinType(null)).toBe(false);
        });
    });

    describe('createMockAIResponse', () => {

        test('should create valid mock response', () => {
            const item = {
                itemName: "Mock Item",
                primaryBin: "recyclable",
                primaryConfidence: 0.9
            };

            const response = createMockAIResponse(item);
            const parsed = JSON.parse(response);

            expect(parsed.items).toHaveLength(1);
            expect(parsed.items[0]).toEqual(item);
        });
    });

    describe('Edge Cases', () => {

        test('should handle all valid bin types', () => {
            const binTypes = ['recyclable', 'organic', 'general-waste', 'hazardous', 'error'];

            binTypes.forEach(binType => {
                const response = createMockAIResponse({
                    itemName: `Test ${binType}`,
                    primaryBin: binType,
                    primaryConfidence: binType === 'error' ? 0 : 0.8
                });

                const parsed = parseAIResponse(response);
                expect(parsed.items[0].primaryBin).toBe(binType);
            });
        });

        test('should handle confidence edge values', () => {
            const confidenceValues = [0, 0.01, 0.5, 0.99, 1.0];

            confidenceValues.forEach(confidence => {
                const response = createMockAIResponse({
                    itemName: "Test",
                    primaryBin: "recyclable",
                    primaryConfidence: confidence
                });

                const parsed = parseAIResponse(response);
                expect(parsed.items[0].primaryConfidence).toBe(confidence);
            });
        });
    });
});
