---
sidebar_position: 1
title: Lark Jobs Overview
description: Learn about @s18i/lark-jobs - a robust job processing system built on Bull and Redis for background task processing in TypeScript.
keywords: [lark-jobs, bull, redis, queues, background jobs, job processing, typescript]
---

# Lark Jobs Overview

`@s18i/lark-jobs` is a robust job processing system built on [Bull](https://github.com/OptimalBits/bull) and Redis. It provides Laravel-inspired queue-based background job processing for TypeScript applications.

## Features

- **Queue-based Processing** — Jobs are added to Redis-backed queues
- **Automatic Retries** — Failed jobs are retried with configurable attempts
- **Delayed Execution** — Schedule jobs to run after a delay
- **Multiple Queues** — Organize jobs into different priority queues
- **Type-safe Payloads** — Full TypeScript support for job data
- **Built-in Logging** — Consistent output for job processing

## How It Works

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Your Code     │         │     Redis       │         │   Job Worker    │
│                 │         │                 │         │                 │
│  job.dispatch() │────────▶│  Queue Storage  │────────▶│  job.handle()   │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

1. **Dispatch** — Your code creates a job and dispatches it to a queue
2. **Store** — The job is stored in Redis with its payload and options
3. **Process** — A worker picks up the job and executes the `handle()` method
4. **Complete** — On success, the job is removed (or kept based on config)
5. **Retry** — On failure, the job is retried up to the configured attempts

## Installation

```bash
bun add @s18i/lark-jobs
```

You'll also need Redis running. The easiest way is with Docker:

```bash
docker run -d -p 6379:6379 redis:latest
```

Or use the provided `docker-compose.yml` in a scaffolded Lark project.

## Basic Usage

### 1. Create a Job

```typescript
import { Job } from '@s18i/lark-jobs'

class SendEmailJob extends Job {
  async handle(payload: { to: string; subject: string }) {
    // Send the email
    this.info(`Sending email to ${payload.to}`)
    return true
  }
}

Job.register(SendEmailJob)
```

### 2. Dispatch the Job

```typescript
await new SendEmailJob().dispatch({
  to: 'user@example.com',
  subject: 'Welcome!'
})
```

### 3. Start the Worker

```typescript
import { initQueues } from '@s18i/lark-jobs'

initQueues()
```

Or run via npm script:

```bash
bun run lark-jobs
```

## Job Lifecycle

Jobs go through these states:

1. **Created** — Job instance created in your code
2. **Queued** — Job added to Redis queue via `dispatch()`
3. **Active** — Worker is processing the job
4. **Completed** — Job finished successfully
5. **Failed** — Job threw an error (will retry if attempts remain)

```
Created ──▶ Queued ──▶ Active ──┬──▶ Completed
                                │
                                └──▶ Failed ──▶ Retry ──▶ Active
                                        │
                                        └──▶ (Max retries) ──▶ Dead
```

## Key Concepts

### Queues

Jobs are organized into named queues. Each queue processes jobs independently:

```javascript
// lark.config.js
export default {
  jobs: {
    queues: ['default', 'emails', 'reports']
  }
}
```

### Workers

Workers are processes that consume jobs from queues. Run multiple workers for parallel processing:

```bash
# Terminal 1
bun run lark-jobs

# Terminal 2
bun run lark-jobs
```

### Payloads

Data passed to jobs. Should be JSON-serializable:

```typescript
await new ProcessOrderJob().dispatch({
  orderId: 12345,
  userId: 67890,
  items: ['item-a', 'item-b']
})
```

## Comparison with Laravel

| Laravel | Lark Jobs |
|---------|-----------|
| `dispatch(new SendEmailJob($data))` | `new SendEmailJob().dispatch(data)` |
| `SendEmailJob::dispatch($data)` | `new SendEmailJob().dispatch(data)` |
| `SendEmailJob::dispatchNow($data)` | `new SendEmailJob().dispatchNow(data)` |
| `$job->delay(60)` | `job.delay = 60000` (milliseconds) |
| `php artisan queue:work` | `bun run lark-jobs` |

## Next Steps

- Learn to [create jobs](/lark-jobs/creating-jobs)
- Understand [dispatching options](/lark-jobs/dispatching-jobs)
- Configure [queue workers](/lark-jobs/queue-workers)
