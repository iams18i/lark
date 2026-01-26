---
sidebar_position: 3
title: Dispatching Jobs
description: Learn how to dispatch jobs to queues in Lark. Covers dispatch(), dispatchNow(), delayed jobs, and best practices.
keywords: [lark-jobs, dispatch, dispatchNow, delayed jobs, queue, job chaining]
---

# Dispatching Jobs

Once you've created a job, you need to dispatch it to be processed. Lark Jobs provides two methods: `dispatch()` for queueing and `dispatchNow()` for immediate execution.

## Dispatching to Queue

Use `dispatch()` to add a job to the queue for background processing:

```typescript
import { SendEmailJob } from './jobs/SendEmailJob'

await new SendEmailJob().dispatch({
  to: 'user@example.com',
  subject: 'Welcome!',
  body: 'Thanks for signing up.'
})
```

The job is added to Redis and will be processed by a worker.

## Immediate Execution

Use `dispatchNow()` to execute a job immediately, bypassing the queue:

```typescript
await new SendEmailJob().dispatchNow({
  to: 'admin@example.com',
  subject: 'Urgent Alert',
  body: 'Something needs attention.'
})
```

This is useful for:
- Testing jobs during development
- Critical tasks that can't wait
- Synchronous workflows

## Delayed Jobs

Schedule a job to run after a delay by setting the `delay` property:

```typescript
const job = new SendReminderJob()
job.delay = 60000  // 1 minute in milliseconds

await job.dispatch({
  userId: 123,
  message: 'Don\'t forget to complete your profile!'
})
```

### Common Delay Values

```typescript
// Seconds
job.delay = 30 * 1000       // 30 seconds

// Minutes
job.delay = 5 * 60 * 1000   // 5 minutes

// Hours
job.delay = 2 * 60 * 60 * 1000  // 2 hours
```

## Dispatching from Commands

A common pattern is dispatching jobs from CLI commands:

```typescript
import { Command } from '@s18i/lark'
import { ProcessUserJob } from '../jobs/ProcessUserJob'

class ProcessAllUsersCommand extends Command {
  readonly key = 'users:process'
  description = 'Queue processing jobs for all users'

  async handle() {
    const users = await this.getUsers()
    
    this.info(`Queueing ${users.length} jobs...`)
    
    for (const user of users) {
      await new ProcessUserJob().dispatch({ userId: user.id })
    }
    
    this.success(`Queued ${users.length} jobs`)
    return true
  }

  private async getUsers() {
    // Fetch users from database
    return [{ id: 1 }, { id: 2 }, { id: 3 }]
  }
}
```

## Dispatching from Other Jobs

Jobs can dispatch other jobs, enabling job chaining:

```typescript
import { Job } from '@s18i/lark-jobs'
import { SendEmailJob } from './SendEmailJob'
import { UpdateStatsJob } from './UpdateStatsJob'

class ProcessOrderJob extends Job {
  async handle(payload: { orderId: string }) {
    this.info(`Processing order ${payload.orderId}`)
    
    // Process the order
    await this.processOrder(payload.orderId)
    
    // Dispatch follow-up jobs
    await new SendEmailJob().dispatch({
      to: 'customer@example.com',
      subject: 'Order Confirmed',
      body: `Your order ${payload.orderId} has been processed.`
    })
    
    await new UpdateStatsJob().dispatch({
      type: 'order_completed',
      orderId: payload.orderId
    })
    
    this.success('Order processed and follow-up jobs queued')
    return true
  }

  private async processOrder(orderId: string) {
    // Order processing logic
  }
}
```

## Specifying Queues

Jobs are dispatched to their configured `queueName`. You can create jobs for different queues:

```typescript
// High priority email
class UrgentEmailJob extends Job {
  queueName = 'high-priority'
  
  async handle(payload: EmailPayload) {
    // Urgent email logic
    return true
  }
}

// Regular email
class RegularEmailJob extends Job {
  queueName = 'emails'
  
  async handle(payload: EmailPayload) {
    // Regular email logic
    return true
  }
}

// Low priority report
class GenerateReportJob extends Job {
  queueName = 'low-priority'
  
  async handle(payload: ReportPayload) {
    // Report generation logic
    return true
  }
}
```

Make sure these queues are defined in your configuration:

```javascript
// lark.config.js
export default {
  jobs: {
    queues: ['default', 'high-priority', 'emails', 'low-priority']
  }
}
```

## Bulk Dispatching

For dispatching many jobs efficiently:

```typescript
class BulkProcessCommand extends Command {
  readonly key = 'bulk:process'

  async handle() {
    const items = await this.getItems()  // 10,000 items
    
    this.info(`Dispatching ${items.length} jobs...`)
    
    // Dispatch in batches to avoid overwhelming Redis
    const batchSize = 100
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(item => 
          new ProcessItemJob().dispatch({ itemId: item.id })
        )
      )
      
      this.info(`Dispatched ${Math.min(i + batchSize, items.length)}/${items.length}`)
    }
    
    this.success('All jobs dispatched')
    return true
  }
}
```

## Error Handling

Handle dispatch errors appropriately:

```typescript
try {
  await new SendEmailJob().dispatch({
    to: 'user@example.com',
    subject: 'Hello'
  })
  console.log('Job dispatched successfully')
} catch (error) {
  console.error('Failed to dispatch job:', error.message)
  // Handle the error (e.g., retry, log, alert)
}
```

## Checking Job Status

The `dispatch()` method returns a boolean indicating success:

```typescript
const dispatched = await new MyJob().dispatch(payload)

if (dispatched) {
  console.log('Job queued successfully')
} else {
  console.log('Failed to queue job')
}
```

## Best Practices

### 1. Keep Payloads Small

Store IDs, not entire objects:

```typescript
// Good - store ID
await new ProcessUserJob().dispatch({ userId: 123 })

// Avoid - storing large objects
await new ProcessUserJob().dispatch({ user: largeUserObject })
```

### 2. Make Jobs Idempotent

Design jobs to be safe to retry:

```typescript
class ProcessPaymentJob extends Job {
  async handle(payload: { paymentId: string }) {
    // Check if already processed
    if (await this.isAlreadyProcessed(payload.paymentId)) {
      this.info('Payment already processed, skipping')
      return true
    }
    
    // Process payment
    await this.processPayment(payload.paymentId)
    return true
  }
}
```

### 3. Use Appropriate Queues

Separate jobs by priority and type:

```typescript
// Critical - user-facing
await new SendPasswordResetJob().dispatch({ ... })  // high-priority queue

// Regular - background
await new UpdateSearchIndexJob().dispatch({ ... })  // default queue

// Low priority - can wait
await new GenerateReportJob().dispatch({ ... })     // low-priority queue
```

## Next Steps

- Configure [queue workers](/lark-jobs/queue-workers)
- Review [job creation](/lark-jobs/creating-jobs)
