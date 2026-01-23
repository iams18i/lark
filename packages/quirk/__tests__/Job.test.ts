import { Job } from '../src/Job'
import { Config } from '@s18i/lark'
import * as indexModule from '../src/index'
import consola from 'consola'
import { describe, expect, it, mock, beforeEach } from 'bun:test'

// Mock consola methods
const mockConsola = {
  info: mock((...args) => {
    console.log('consola.info called with:', ...args)
  }),
  error: mock((...args) => {
    console.log('consola.error called with:', ...args)
  }),
  success: mock((...args) => {
    console.log('consola.success called with:', ...args)
  }),
}
Object.assign(consola, mockConsola)

// Mock queue
const mockQueue = {
  add: mock(() => Promise.resolve(true)),
  close: mock(() => {}),
}

// Overwrite configureQueue to return mockQueue
function mockConfigureQueueImpl() {
  return mockQueue
}
;(indexModule as any).configureQueue = mock(mockConfigureQueueImpl)
const mockConfigureQueue = (indexModule as any).configureQueue

declare global {
  var mockConsola: typeof consola
  // var mockConfigureQueue: jest.Mock // Removed jest reference
}

describe('Job', () => {
  // Create a test job class
  class TestJob extends Job {
    queueName = 'test-queue'

    async handle(): Promise<boolean> {
      return true
    }
  }

  let job: TestJob

  beforeEach(() => {
    mockConsola.info.mockClear()
    mockConsola.error.mockClear()
    mockConsola.success.mockClear()
    if (mockConfigureQueue.mockClear) mockConfigureQueue.mockClear()
    mockQueue.add.mockClear()
    mockQueue.close.mockClear()
    Config.jobs = {}
    job = new TestJob()
  })

  describe('Job Registration', () => {
    it('should register a job with Config', () => {
      Job.register(TestJob)
      expect(Config.jobs['TestJob']).toBe(TestJob)
    })
  })

  describe('Job Dispatch', () => {
    it('should dispatch job to queue', async () => {
      const payload = { userId: 123, action: 'test' }
      const result = await job.dispatch(payload)

      expect(mockConfigureQueue).toHaveBeenCalledWith('test-queue')
      expect(mockQueue.add).toHaveBeenCalledWith({
        job: 'TestJob',
        payload,
      })
      expect(mockQueue.close).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should dispatch job synchronously', async () => {
      const result = await job.dispatchNow()
      expect(result).toBe(true)
    })

    it('should dispatch job synchronously with payload', async () => {
      const payload = { data: 'test' }
      const result = await job.dispatchNow(payload)
      expect(result).toBe(true)
    })
  })

  describe('Logging Methods', () => {
    it('should log info messages', () => {
      job.info('Test info message')
      // Debug: print what was actually called
      console.log('info calls:', mockConsola.info.mock.calls)
      expect(mockConsola.info).toHaveBeenCalledWith({
        message: expect.stringContaining('TestJob Test info message'),
      })
    })

    it('should log info messages with badge', () => {
      job.info('Test info message', true)
      console.log('info calls:', mockConsola.info.mock.calls)
      expect(mockConsola.info).toHaveBeenCalledWith({
        message: expect.stringContaining('TestJob Test info message'),
        badge: true,
      })
    })

    it('should log error messages', () => {
      job.error('Test error message')
      console.log('error calls:', mockConsola.error.mock.calls)
      expect(mockConsola.error).toHaveBeenCalledWith({
        message: expect.stringContaining('TestJob Test error message'),
      })
    })

    it('should log success messages', () => {
      job.success('Test success message')
      console.log('success calls:', mockConsola.success.mock.calls)
      expect(mockConsola.success).toHaveBeenCalledWith({
        message: expect.stringContaining('TestJob Test success message'),
      })
    })
  })

  describe('Job Configuration', () => {
    it('should have default queue name', () => {
      const defaultJob = new TestJob()
      expect(defaultJob.queueName).toBe('test-queue')
    })

    it('should have default attempts', () => {
      const defaultJob = new TestJob()
      expect(defaultJob.attempts).toBe(5)
    })

    it('should have default delay', () => {
      const defaultJob = new TestJob()
      expect(defaultJob.delay).toBe(0)
    })
  })
})
