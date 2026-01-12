// Unit test helpers - extracted logic from app.js for isolated testing
// These are copies of key functions to enable unit testing without refactoring

/**
 * Parse AI response content and validate structure
 * @param {string} responseContent - Raw response from AI API
 * @returns {object} Parsed and validated response
 * @throws {Error} If response is invalid
 */
function parseAIResponse(responseContent) {
    try {
        // Handle markdown code blocks if present
        let jsonContent = responseContent;
        const jsonMatch = responseContent.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            jsonContent = jsonMatch[1];
        }

        const parsed = JSON.parse(jsonContent);

        // Validate structure
        if (!parsed.items || !Array.isArray(parsed.items)) {
            throw new Error('Invalid response structure: missing items array');
        }

        // Validate each item
        parsed.items.forEach((item, index) => {
            validateItem(item, index);
        });

        return parsed;
    } catch (error) {
        if (error.message.includes('Invalid response') || error.message.includes('Invalid primaryBin') || error.message.includes('Invalid primaryConfidence')) {
            throw error;
        }
        throw new Error(`Failed to parse AI response: ${error.message}`);
    }
}

/**
 * Validate a single item from AI response
 * @param {object} item - Item object to validate
 * @param {number} index - Item index in array
 * @throws {Error} If item is invalid
 */
function validateItem(item, index) {
    const validBins = ['recyclable', 'organic', 'general-waste', 'hazardous', 'error'];

    // Validate primaryBin
    if (!item.primaryBin) {
        throw new Error(`Missing primaryBin at item ${index}`);
    }

    if (!validBins.includes(item.primaryBin)) {
        throw new Error(`Invalid primaryBin "${item.primaryBin}" at item ${index}. Must be one of: ${validBins.join(', ')}`);
    }

    // Validate primaryConfidence (required for non-error items)
    if (item.primaryBin !== 'error') {
        if (typeof item.primaryConfidence !== 'number') {
            throw new Error(`Invalid or missing primaryConfidence at item ${index}`);
        }

        if (item.primaryConfidence < 0 || item.primaryConfidence > 1) {
            throw new Error(`Invalid primaryConfidence at item ${index}: must be between 0 and 1, got ${item.primaryConfidence}`);
        }
    }

    // Validate optional secondaryConfidence if present
    if (item.secondaryConfidence !== undefined && item.secondaryConfidence !== null) {
        if (typeof item.secondaryConfidence !== 'number' || item.secondaryConfidence < 0 || item.secondaryConfidence > 1) {
            throw new Error(`Invalid secondaryConfidence at item ${index}: must be between 0 and 1 or null`);
        }
    }

    // Validate itemName is present
    if (!item.itemName || typeof item.itemName !== 'string') {
        throw new Error(`Invalid or missing itemName at item ${index}`);
    }
}

/**
 * Validate bin type is valid
 * @param {string} binType - Bin type to validate
 * @returns {boolean} True if valid
 */
function isValidBinType(binType) {
    const validBins = ['recyclable', 'organic', 'general-waste', 'hazardous', 'error'];
    return validBins.includes(binType);
}

/**
 * Mock function to simulate AI response format
 * @param {object} item - Item data
 * @returns {string} JSON string
 */
function createMockAIResponse(item) {
    return JSON.stringify({
        items: [item]
    });
}

module.exports = {
    parseAIResponse,
    validateItem,
    isValidBinType,
    createMockAIResponse
};
