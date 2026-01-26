import Queue, { type DoneCallback } from 'bull'
import chalk from 'chalk'
import { Config } from '@s18i/lark'
import consola from 'consola'
import { colorize } from 'consola/utils'
import { readFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
export { Job } from './Job'

let isInitialized = false
const queueMap: Record<string, Queue.Queue> = {}

// Lazy-loaded queues proxy
export const queues = new Proxy(queueMap, {
  get: (target, prop: string) => {
    if (Object.values(target).length === 0) {
      target = initQueues()
    }

    return target[prop]
  },
  set: (target, prop: string, value: Queue.Queue) => {
    if (!(value instanceof Queue)) {
      throw new Error('Can only assign Bull Queue instances')
    }
    target[prop] = value
    return true
  },
})

export function loadJobs() {
  if (Config.data.jobs) {
    consola.info({
      message: '📂 Loading jobs...',
    })
    const jobsPath = resolve(process.cwd(), Config.data.jobs.dir)
    try {
      const commandFiles = readdirSync(jobsPath).filter(
        (file) => file.endsWith('.ts') || file.endsWith('.js'),
      )
      for (const file of commandFiles) {
        require(join(jobsPath, file))
      }

      consola.info(`Jobs: ${Object.keys(Config.jobs).join(', ')}`)
    } catch (error) {
      consola.error({
        message: `Error loading jobs: ${(error as Error).message}`,
        badge: true,
      })
    }
  }
}

export function configureQueue(queueName: string) {
  return new Queue(queueName, {
    redis: Config.data.redis,
    defaultJobOptions: {
      removeOnComplete: Config.data.jobs.options?.removeOnComplete,
      attempts: Config.data.jobs.options?.attempts || 2,
    },
  })
}

// Internal function to initialize queues
export function initQueues() {
  loadJobs()
  if (!isInitialized) {
    consola.info({
      message: '🚀 Initializing job queues...',
    })

    if (!Config.data.jobs?.queues?.length) {
      consola.warn({
        message: '⚠️  No queues configured',
        badge: true,
      })
      isInitialized = true
      return {}
    }

    consola.info({
      message: `📦 Queues: ${Config.data.jobs.queues.join(', ')}`,
    })
    isInitialized = true
  }

  consola.debug({
    message: `Config jobs: ${JSON.stringify(Config.jobs, null, 2)}`,
    badge: true,
  })

  if (Config.data.jobs?.queues) {
    for (const queueName of Config.data.jobs.queues) {
      queues[queueName] = new Queue(queueName, {
        redis: Config.data.redis,
        defaultJobOptions: {
          removeOnComplete: Config.data.jobs.options?.removeOnComplete,
          attempts: Config.data.jobs.options?.attempts || 2,
        },
      })

      queues[queueName].process(
        1,
        async function (jobObject: any, done: DoneCallback) {
          const { job, payload } = jobObject.data

          consola.info({
            message: ` Processing job ${colorize('cyan', `${jobObject.id}`)}: ${colorize('blueBright', `${job}`)}`,
            // badge: true,
          })
          consola.debug({
            message: `Payload: ${JSON.stringify(payload, null, 2)}`,
            badge: true,
          })

          const jobHandler = Config.jobs[job]

          if (!jobHandler) {
            consola.error({
              message: `❌ No handler found for job type "${job}". Make sure you have created a job handler in your jobs directory.`,
              badge: true,
            })
            return
          }

          try {
            const status = await new jobHandler().handle(payload)

            consola.info({
              message: `Job ${job} completed with status: ${status}`,
            })
            done()
          } catch (error) {
            consola.error({
              message: `❌ Error processing job ${job}: ${(error as Error).message}`,
              badge: true,
            })
            done(error as Error)
          }
        },
      )
    }
  }

  consola.success({
    message: '✨ Ready to go! Listening for jobs...',
  })

  return queues
}

export function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}
