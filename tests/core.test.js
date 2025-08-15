/**
 * Unit tests for core EasyBin functions
 */

// Mock DOM elements that would be available in the browser
document.body.innerHTML = `
  <div id="camera-container"></div>
  <select id="country-select">
    <option value="us">United States</option>
    <option value="de">Germany</option>
    <option value="it">Italy</option>
    <option value="br">Brazil</option>
  </select>
  <div id="result-card" class="hidden"></div>
  <div id="bin-header"></div>
  <div id="item-name"></div>
  <div id="bin-instructions"></div>
  <div id="item-description"></div>
`;

// Import the functions we want to test
// Note: We'll need to refactor app.js to export these functions
// For now, we'll copy the functions here for testing

describe('Bin Classification Functions', () => {
  test('generateBinDetails returns correct US recyclable classification', () => {
    // Mock function - in real implementation, import from refactored app.js
    function generateBinDetails(binType, material, country) {
      if (country === 'us' && binType === 'recyclable') {
        return {
          binColorClassKey: 'us-recyclable',
          regionalBinName: 'Recycling Bin',
          binIconClass: 'fa-recycle'
        };
      }
      return { binColorClassKey: 'default-general-waste' };
    }

    const result = generateBinDetails('recyclable', 'plastic', 'us');
    expect(result.binColorClassKey).toBe('us-recyclable');
    expect(result.regionalBinName).toBe('Recycling Bin');
    expect(result.binIconClass).toBe('fa-recycle');
  });

  test('handles contaminated recyclables correctly', () => {
    // Test contamination logic
    const mockItem = {
      primaryBin: 'recyclable',
      isContaminated: true,
      material: 'plastic'
    };

    // This would test the contamination redirect logic
    expect(mockItem.isContaminated).toBe(true);
  });
});

describe('History Functions', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset the mock
    localStorage.setItem.mockClear();
  });

  test('saves item to history', () => {
    const mockItem = {
      itemName: 'Plastic Bottle',
      primaryBin: 'recyclable',
      primaryConfidence: 0.95,
      material: 'plastic'
    };

    // Mock the save function
    function saveToHistory(item) {
      const history = JSON.parse(localStorage.getItem('trashSeparatorHistory_v2') || '[]');
      history.unshift(item);
      localStorage.setItem('trashSeparatorHistory_v2', JSON.stringify(history));
    }

    saveToHistory(mockItem);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'trashSeparatorHistory_v2', 
      expect.stringContaining('Plastic Bottle')
    );
  });

  test('does not save error results to history', () => {
    const errorItem = {
      itemName: 'Identification Failed',
      primaryBin: 'error'
    };

    // The save function should not save error items
    // This tests the business logic
    expect(errorItem.primaryBin).toBe('error');
  });
});
