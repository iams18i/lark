// Mock consola
jest.mock('consola', () => ({
  info: jest.fn(),
  error: jest.fn(),
  success: jest.fn(),
}))

// Mock @s18i/lark
jest.mock('@s18i/lark', () => ({
  Config: {
    jobs: {},
  },
}))

// Mock index
jest.mock('../index', () => ({
  configureQueue: jest.fn(),
  queues: {},
  initQueues: jest.fn(),
}))

// Export mocks for use in tests
global.mockConsola = {
  info: jest.fn(),
  error: jest.fn(),
  success: jest.fn(),
}
global.mockConfigureQueue = jest.fn()
