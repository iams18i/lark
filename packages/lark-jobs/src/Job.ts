import { Config } from '@s18i/lark'
// import Queue, { JobOptions, Queue as QueueInterface } from 'bull'
import { configureQueue, initQueues, queues } from './index'
import consola from 'consola'
import { colorize } from 'consola/utils'
import type { JobOptions, Queue } from 'bull'

export abstract class Job {
  queueName = 'default'
  queue?: Queue
  delayInSeconds = 0
  attempts = 5

  constructor() {
    // Constructor remains empty, allowing subclasses to define their own initialization if needed
  }

  abstract handle(payload?: any): Promise<boolean> | boolean

  // Main execution method for the command, must be implemented by subclasses
  async dispatch(payload?: any): Promise<boolean> {
    this.queue = configureQueue(this.queueName)
    if (Config.data.jobs?.options?.debug === true) {
      this.info('Job added to queue')
    }

    await this.queue.add(
      {
        job: this.constructor.name,
        payload,
      },
      this.getOptions(),
    )

    this.queue.close()

    return true
  }

  async dispatchNow(payload?: any): Promise<boolean> {
    if (Config.data.jobs?.options?.debug === true) {
      this.info('Dispatching job synchronously')
    }
    return this.handle(payload)
  }

  static register(job: any) {
    Config.jobs[job.name] = job
  }

  getOptions() {
    const options: JobOptions = {}

    if (this.delayInSeconds) {
      options.delay = this.delayInSeconds * 1000
    }

    if (this.attempts) {
      options.attempts = this.attempts
    }

    return options
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

  delay(seconds: number) {
    this.delayInSeconds = seconds
    return this
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
