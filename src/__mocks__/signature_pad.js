// Mock para signature_pad — evita crash de Canvas en Jest/jsdom
const MockSignaturePad = jest.fn().mockImplementation(() => ({
  on: jest.fn(),
  off: jest.fn(),
  clear: jest.fn(),
  isEmpty: jest.fn().mockReturnValue(true),
  toDataURL: jest.fn().mockReturnValue('data:image/png;base64,'),
  toData: jest.fn().mockReturnValue([]),
  fromData: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}))

module.exports = MockSignaturePad
module.exports.default = MockSignaturePad
