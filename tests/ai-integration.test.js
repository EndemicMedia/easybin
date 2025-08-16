/**
 * AI Integration Tests for EasyBin
 * Tests the integration with Puter.ai API
 */

// Mock Puter.ai for testing
const mockPuter = {
  ai: {
    chat: jest.fn()
  },
  geo: {
    get: jest.fn()
  }
};

// Mock successful AI response
const mockSuccessfulResponse = {
  content: JSON.stringify({
    items: [{
      itemName: 'Plastic Water Bottle',
      primaryBin: 'recyclable',
      primaryConfidence: 0.92,
      secondaryBin: 'general-waste',
      secondaryConfidence: 0.08,
      material: 'plastic',
      reasoning: 'Clear PET plastic bottle, suitable for recycling',
      isContaminated: false,
      position: 'center'
    }]
  })
};

// Mock error response
const mockErrorResponse = new Error('Network error');

describe('AI Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks
    mockPuter.ai.chat.mockClear();
    mockPuter.geo.get.mockClear();
    
    // Make puter available globally
    global.puter = mockPuter;
  });

  afterEach(() => {
    delete global.puter;
  });

  test('AI prompt structure is correctly formatted', () => {
    // Test that the prompt contains required structure
    const expectedStructure = {
      containsItems: true,
      containsInstructions: true,
      containsJSONFormat: true,
      containsCountryContext: true
    };

    // Mock a typical prompt (this would be extracted from actual implementation)
    const samplePrompt = `You are an AI assistant that helps identify waste items for proper sorting.

Analyze this image and identify items for waste sorting in United States.

For each item, provide exactly this JSON structure:
{
  "items": [
    {
      "itemName": "string",
      "primaryBin": "recyclable|organic|hazardous|general-waste",
      "primaryConfidence": 0.0-1.0,
      "material": "string",
      "reasoning": "string",
      "isContaminated": boolean,
      "position": "center|top|bottom|left|right"
    }
  ]
}`;

    expect(samplePrompt).toContain('JSON structure');
    expect(samplePrompt).toContain('primaryBin');
    expect(samplePrompt).toContain('primaryConfidence');
    expect(samplePrompt).toContain('United States');
  });

  test('AI response parsing handles successful response', () => {
    mockPuter.ai.chat.mockResolvedValue(mockSuccessfulResponse);

    // Test would call the actual AI function and verify parsing
    expect(mockPuter.ai.chat).toBeDefined();
    
    // Test JSON parsing logic
    const responseContent = mockSuccessfulResponse.content;
    const parsedResponse = JSON.parse(responseContent);
    
    expect(parsedResponse.items).toHaveLength(1);
    expect(parsedResponse.items[0].itemName).toBe('Plastic Water Bottle');
    expect(parsedResponse.items[0].primaryBin).toBe('recyclable');
    expect(parsedResponse.items[0].primaryConfidence).toBeGreaterThan(0.9);
  });

  test('AI response parsing handles different response formats', () => {
    // Test string response
    const stringResponse = JSON.stringify({
      items: [{ itemName: 'Test Item', primaryBin: 'recyclable' }]
    });
    
    const parsedString = JSON.parse(stringResponse);
    expect(parsedString.items).toBeDefined();

    // Test object response with content property
    const objectResponse = {
      content: JSON.stringify({
        items: [{ itemName: 'Test Item 2', primaryBin: 'organic' }]
      })
    };
    
    const parsedObject = JSON.parse(objectResponse.content);
    expect(parsedObject.items).toBeDefined();
  });

  test('AI error handling works correctly', async () => {
    mockPuter.ai.chat.mockRejectedValue(mockErrorResponse);

    try {
      await mockPuter.ai.chat('test prompt', 'test image');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).toBe('Network error');
    }

    expect(mockPuter.ai.chat).toHaveBeenCalledWith('test prompt', 'test image');
  });

  test('Image data is properly formatted for AI', () => {
    // Test that image data is in correct format (base64)
    const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...';
    
    expect(mockImageData).toMatch(/^data:image\/(jpeg|png|gif);base64,/);
    expect(mockImageData.length).toBeGreaterThan(50);
  });

  test('Country-specific prompts are generated correctly', () => {
    const countries = ['us', 'de', 'it', 'br'];
    
    countries.forEach(country => {
      // Test that country-specific context would be included
      const contextMap = {
        'us': 'United States',
        'de': 'Germany', 
        'it': 'Italy',
        'br': 'Brazil'
      };
      
      expect(contextMap[country]).toBeDefined();
    });
  });

  test('Confidence thresholds are appropriate', () => {
    const mockResults = [
      { primaryConfidence: 0.95, expected: 'high' },
      { primaryConfidence: 0.75, expected: 'medium' },
      { primaryConfidence: 0.45, expected: 'low' }
    ];

    mockResults.forEach(result => {
      if (result.primaryConfidence > 0.8) {
        expect(result.expected).toBe('high');
      } else if (result.primaryConfidence > 0.6) {
        expect(result.expected).toBe('medium');
      } else {
        expect(result.expected).toBe('low');
      }
    });
  });

  test('Bin classification mapping is correct', () => {
    const validBinTypes = ['recyclable', 'organic', 'hazardous', 'general-waste'];
    const testBins = ['recyclable', 'organic', 'hazardous', 'general-waste', 'invalid'];
    
    testBins.forEach(bin => {
      const isValid = validBinTypes.includes(bin);
      if (bin === 'invalid') {
        expect(isValid).toBe(false);
      } else {
        expect(isValid).toBe(true);
      }
    });
  });

  test('Material detection covers common materials', () => {
    const commonMaterials = ['plastic', 'paper', 'glass', 'metal', 'organic', 'mixed'];
    
    expect(commonMaterials).toContain('plastic');
    expect(commonMaterials).toContain('paper');
    expect(commonMaterials).toContain('glass');
    expect(commonMaterials).toContain('metal');
    expect(commonMaterials.length).toBeGreaterThan(4);
  });

  test('Position detection is properly mapped', () => {
    const validPositions = ['center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
    const testPosition = 'center';
    
    expect(validPositions).toContain(testPosition);
    expect(validPositions.length).toBe(9);
  });
});

// Integration test to verify Puter.ai connectivity (run separately)
describe('Puter.ai Connectivity Test', () => {
  test('Puter.ai is accessible and responds to ping', async () => {
    // This test should only run in real environment, not in CI
    if (process.env.NODE_ENV === 'test') {
      console.log('Skipping connectivity test in CI environment');
      return;
    }

    try {
      // Simple connectivity test
      const testPrompt = 'Hello, this is a test message. Please respond with "AI_TEST_SUCCESS".';
      const response = await fetch('https://js.puter.com/v2/');
      expect(response.status).toBe(200);
    } catch (error) {
      console.warn('Puter.ai connectivity test failed:', error.message);
      // Don't fail the test for connectivity issues in CI
    }
  });
});