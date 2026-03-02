import '@testing-library/jest-dom'

// Mock signature_pad — usa Canvas APIs que crashean en jsdom
jest.mock('signature_pad', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      off: jest.fn(),
      clear: jest.fn(),
      isEmpty: jest.fn().mockReturnValue(true),
      toDataURL: jest.fn().mockReturnValue('data:image/png;base64,'),
      toData: jest.fn().mockReturnValue([]),
      fromData: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  }
})
