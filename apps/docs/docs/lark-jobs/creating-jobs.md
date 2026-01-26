---
sidebar_position: 2
title: Creating Jobs
description: Learn how to create background jobs in Lark. Includes Job class API, typed payloads, error handling, and practical examples.
keywords: [lark-jobs, create job, Job class, background tasks, typescript, queues]
---

# Creating Jobs

Jobs are classes that define background tasks. Each job extends the `Job` base class and implements a `handle()` method.

## Basic Job Structure

```typescript
import { Job } from '@s18i/lark-jobs'

class MyJob extends Job {
  async handle(payload?: any): Promise<boolean> {
    // Your job logic here
    return true
  }
}

Job.register(MyJob)

export { MyJob }
```

## Job Properties

### `queueName`

Specifies which queue this job belongs to. Defaults to `'default'`.

```typescript
class HighPriorityJob extends Job {
  queueName = 'high-priority'
  
  async handle() {
    return true
  }
}
```

### `attempts`

Number of times to retry a failed job. Defaults to `5`.

```typescript
class CriticalJob extends Job {
  attempts = 10  // Retry up to 10 times
  
  async handle() {
    return true
  }
}
```

### `delay`

Delay in milliseconds before the job is processed. Set per-instance before dispatching.

```typescript
const job = new SendReminderJob()
job.delay = 60000  // 1 minute delay

await job.dispatch({ userId: 123 })
```

## Typed Payloads

Use TypeScript interfaces for type-safe payloads:

```typescript
import { Job } from '@s18i/lark-jobs'

interface SendEmailPayload {
  to: string
  subject: string
  body: string
  attachments?: string[]
}

class SendEmailJob extends Job {
  async handle(payload: SendEmailPayload): Promise<boolean> {
    const { to, subject, body, attachments } = payload
    
    this.info(`Sending email to ${to}`)
    
    // Email sending logic
    // await emailService.send({ to, subject, body, attachments })
    
    this.success(`Email sent to ${to}`)
    return true
  }
}

Job.register(SendEmailJob)

export { SendEmailJob }
```

## Logging Methods

Jobs have built-in logging methods that prefix output with the job name:

### `this.info(message)`

```typescript
this.info('Processing started')
// [SendEmailJob] ℹ Processing started
```

### `this.success(message)`

```typescript
this.success('Email sent successfully')
// [SendEmailJob] ✔ Email sent successfully
```

### `this.error(message)`

```typescript
this.error('Failed to send email')
// [SendEmailJob] ✖ Failed to send email
```

## Error Handling

Jobs should handle errors gracefully. Throwing an error will trigger a retry:

```typescript
class ProcessPaymentJob extends Job {
  attempts = 3

  async handle(payload: { orderId: string }): Promise<boolean> {
    try {
      await this.processPayment(payload.orderId)
      this.success('Payment processed')
      return true
    } catch (error) {
      this.error(`Payment failed: ${error.message}`)
      
      // Throwing the error triggers retry
      throw error
    }
  }

  private async processPayment(orderId: string) {
    // Payment logic
  }
}
```

### Controlled Failure

Return `false` to mark a job as failed without triggering a retry:

```typescript
async handle(payload: { userId: number }): Promise<boolean> {
  const user = await this.findUser(payload.userId)
  
  if (!user) {
    this.error('User not found - not retrying')
    return false  // Job fails, no retry
  }
  
  // Process user
  return true
}
```

## Job Registration

Every job must be registered to be discoverable by the worker:

```typescript
Job.register(MyJob)
```

Jobs are stored in `Config.jobs` and loaded when `initQueues()` is called.

## Example Jobs

### Data Processing Job

```typescript
import { Job } from '@s18i/lark-jobs'

interface ProcessDataPayload {
  batchId: string
  records: number[]
}

class ProcessDataJob extends Job {
  queueName = 'data-processing'
  attempts = 3

  async handle(payload: ProcessDataPayload): Promise<boolean> {
    const { batchId, records } = payload
    
    this.info(`Processing batch ${batchId} with ${records.length} records`)
    
    for (const recordId of records) {
      await this.processRecord(recordId)
    }
    
    this.success(`Batch ${batchId} completed`)
    return true
  }

  private async processRecord(id: number) {
    // Processing logic
  }
}

Job.register(ProcessDataJob)
export { ProcessDataJob }
```

### Notification Job

```typescript
import { Job } from '@s18i/lark-jobs'

interface NotifyUserPayload {
  userId: number
  type: 'email' | 'sms' | 'push'
  message: string
}

class NotifyUserJob extends Job {
  queueName = 'notifications'

  async handle(payload: NotifyUserPayload): Promise<boolean> {
    const { userId, type, message } = payload
    
    this.info(`Sending ${type} notification to user ${userId}`)
    
    switch (type) {
      case 'email':
        await this.sendEmail(userId, message)
        break
      case 'sms':
        await this.sendSms(userId, message)
        break
      case 'push':
        await this.sendPush(userId, message)
        break
    }
    
    this.success(`Notification sent`)
    return true
  }

  private async sendEmail(userId: number, message: string) {
    // Email logic
  }

  private async sendSms(userId: number, message: string) {
    // SMS logic
  }

  private async sendPush(userId: number, message: string) {
    // Push notification logic
  }
}

Job.register(NotifyUserJob)
export { NotifyUserJob }
```

### Cleanup Job

```typescript
import { Job } from '@s18i/lark-jobs'

class CleanupOldDataJob extends Job {
  queueName = 'maintenance'
  attempts = 1  // Don't retry cleanup jobs

  async handle(): Promise<boolean> {
    this.info('Starting cleanup...')
    
    const deletedCount = await this.deleteOldRecords()
    
    this.success(`Cleaned up ${deletedCount} old records`)
    return true
  }

  private async deleteOldRecords(): Promise<number> {
    // Cleanup logic
    return 42
  }
}

Job.register(CleanupOldDataJob)
export { CleanupOldDataJob }
```

## API Reference

### Job Class

```typescript
abstract class Job {
  // Queue this job belongs to
  queueName: string = 'default'
  
  // Bull queue instance (set when dispatched)
  queue?: Queue
  
  // Delay before processing (milliseconds)
  delay: number = 0
  
  // Number of retry attempts
  attempts: number = 5
  
  // Main execution method
  abstract handle<TData = any>(payload?: TData): Promise<boolean> | boolean
  
  // Dispatch to queue
  dispatch<TData = any>(payload?: TData): Promise<boolean>
  
  // Execute immediately (bypass queue)
  dispatchNow<TData = any>(payload?: TData): Promise<boolean>
  
  // Logging methods
  info(message: string, badge?: boolean, args?: any[]): void
  success(message: string, badge?: boolean): void
  error(message: string, badge?: boolean): void
  
  // Registration
  static register(job: any): void
}
```

## Next Steps

- Learn about [dispatching jobs](/lark-jobs/dispatching-jobs)
- Configure [queue workers](/lark-jobs/queue-workers)
