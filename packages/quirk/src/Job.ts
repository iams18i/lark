import { Config } from '@s18i/lark'
// import Queue, { JobOptions, Queue as QueueInterface } from 'bull'
import { configureQueue, initQueues, queues } from './index'
import consola from 'consola'
import { colorize } from 'consola/utils'
import type { Queue } from 'bull'

export abstract class Job {
  queueName = 'default'
  queue?: Queue
  delay = 0
  attempts = 5

  constructor() {
    // Constructor remains empty, allowing subclasses to define their own initialization if needed
  }

  abstract handle(payload?: any): Promise<boolean> | boolean

  // Main execution method for the command, must be implemented by subclasses
  async dispatch(payload?: any): Promise<boolean> {
    this.queue = configureQueue(this.queueName)
    this.info('Job added to queue')

    await this.queue.add({
      job: this.constructor.name,
      payload,
    })

    this.queue.close()

    return true
  }
  async dispatchNow(payload?: any): Promise<boolean> {
    this.info('Dispatching job synchronously')
    return this.handle(payload)
  }

  static register(job: any) {
    Config.jobs[job.name] = job
  }

  // Utility method for logging informational messages
  info(message: string, badge = false, args: any[] = []): void {
    if (badge) {
      consola.info({
        message: `${colorize('bgCyanBright', ' ' + this.constructor.name + ' ')} ${message}`,
        badge: true,
      })
    } else {
      consola.info({
        message: `${colorize('cyan', this.constructor.name)} ${message}`,
      })
    }
  }

  // Utility method for logging error messages
  error(message: string, badge = false): void {
    if (badge) {
      consola.error({
        message: `${colorize('bgRedBright', ' ' + this.constructor.name + ' ')} ${message}`,
        badge: badge,
      })
    } else {
      consola.error({
        message: `${colorize('redBright', this.constructor.name)} ${message}`,
      })
    }
  }

  // Utility method for logging success messages
  success(message: string, badge = false): void {
    if (badge) {
      consola.success({
        message: `${colorize('bgGreenBright', ' ' + this.constructor.name + ' ')} ${message}`,
        badge: true,
      })
    } else {
      consola.success({
        message: `${colorize('greenBright', this.constructor.name)} ${message}`,
      })
    }
  }
}
