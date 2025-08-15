// Use require instead of import for Jest compatibility
require('@testing-library/jest-dom');

// Mock Puter API
global.puter = {
  ai: {
    chat: jest.fn()
  },
  geo: {
    get: jest.fn()
  }
};

// Mock MediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn()
  }
});

// Mock localStorage with jest functions
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});
