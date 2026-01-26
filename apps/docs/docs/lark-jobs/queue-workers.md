---
sidebar_position: 4
title: Queue Workers
description: Learn how to run and configure queue workers in Lark. Covers initQueues(), multiple workers, retry behavior, and production deployment.
keywords: [lark-jobs, queue workers, initQueues, bull, redis, production, deployment]
---

# Queue Workers

Queue workers are processes that consume and execute jobs from your queues. They run continuously, waiting for new jobs to process.

## Starting Workers

### Using the Entry Point

The standard way to start workers is through the `jobs.ts` entry point:

```typescript
// jobs.ts
import { initQueues } from '@s18i/lark-jobs'

initQueues()
```

Run it with:

```bash
bun run lark-jobs
```

### What `initQueues()` Does

When you call `initQueues()`, Lark Jobs:

1. **Loads Configuration** — Reads `lark.config.js`
2. **Discovers Jobs** — Scans the configured `jobs.dir` for job files
3. **Creates Queues** — Sets up Bull queues for each configured queue name
4. **Registers Handlers** — Associates each job class with its queue
5. **Starts Processing** — Begins listening for and processing jobs

## Multiple Workers

Run multiple worker processes for parallel job processing:

```bash
# Terminal 1
bun run lark-jobs

# Terminal 2
bun run lark-jobs

# Terminal 3
bun run lark-jobs
```

Each worker independently processes jobs from all queues. Bull ensures jobs are only processed once across all workers.

## Queue Configuration

Define your queues in `lark.config.js`:

```javascript
export default {
  jobs: {
    queues: ['default', 'high-priority', 'emails', 'reports'],
    dir: './jobs',
    options: {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 5,
    },
  },
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
}
```

### Queue Options

| Option | Description | Default |
|--------|-------------|---------|
| `removeOnComplete` | Remove job data after success | `true` |
| `removeOnFail` | Remove job data after final failure | `false` |
| `attempts` | Number of retry attempts | `5` |

## Accessing Queues

The `queues` proxy provides access to configured queue instances:

```typescript
import { queues } from '@s18i/lark-jobs'

// Access a specific queue
const defaultQueue = queues.default
const emailQueue = queues.emails

// Get queue stats
const jobCounts = await queues.default.getJobCounts()
console.log(jobCounts)
// { waiting: 5, active: 2, completed: 100, failed: 3 }
```

## Configuring Individual Queues

Use `configureQueue()` for fine-grained queue setup:

```typescript
import { configureQueue } from '@s18i/lark-jobs'

const emailQueue = configureQueue('emails', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
})
```

## Worker Lifecycle

### Startup

```
Worker Start
     │
     ▼
Load Configuration
     │
     ▼
Discover Job Files
     │
     ▼
Create Queue Instances
     │
     ▼
Register Job Handlers
     │
     ▼
Start Processing Loop ◀────┐
     │                     │
     ▼                     │
Wait for Jobs ─────────────┘
```

### Job Processing

```
Job Arrives in Queue
     │
     ▼
Worker Picks Up Job
     │
     ▼
Deserialize Payload
     │
     ▼
Execute handle() Method
     │
     ├── Success ──▶ Mark Complete ──▶ Remove (if configured)
     │
     └── Failure ──▶ Check Attempts
                         │
                         ├── Retries Left ──▶ Requeue with Backoff
                         │
                         └── No Retries ──▶ Mark Failed
```

## Retry Behavior

When a job fails (throws an error), it's retried based on the `attempts` configuration:

```typescript
class UnreliableJob extends Job {
  attempts = 5  // Retry up to 5 times

  async handle() {
    // This might fail
    const result = await this.callUnreliableService()
    return true
  }
}
```

### Backoff Strategy

Configure exponential backoff for retries:

```javascript
// lark.config.js
export default {
  jobs: {
    options: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1000,  // Initial delay: 1 second
      },
    },
  },
}
```

Retry delays with exponential backoff:
- Attempt 1: immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 seconds delay
- Attempt 4: 4 seconds delay
- Attempt 5: 8 seconds delay

## Monitoring Workers

### Job Counts

```typescript
import { queues } from '@s18i/lark-jobs'

const counts = await queues.default.getJobCounts()
console.log('Waiting:', counts.waiting)
console.log('Active:', counts.active)
console.log('Completed:', counts.completed)
console.log('Failed:', counts.failed)
```

### Failed Jobs

```typescript
const failedJobs = await queues.default.getFailed()

for (const job of failedJobs) {
  console.log(`Job ${job.id} failed:`, job.failedReason)
}
```

### Retry Failed Jobs

```typescript
const failedJobs = await queues.default.getFailed()

for (const job of failedJobs) {
  await job.retry()
}
```

## Production Considerations

### Process Management

Use a process manager like PM2 for production:

```bash
# Install PM2
npm install -g pm2

# Start workers
pm2 start jobs.ts --name "lark-worker" -i 4

# View logs
pm2 logs lark-worker

# Monitor
pm2 monit
```

### Graceful Shutdown

Workers handle `SIGTERM` and `SIGINT` signals to complete in-progress jobs before shutting down.

### Redis Connection

For production, configure Redis with:

```javascript
// lark.config.js
export default {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  },
}
```

### Separate Worker Processes

In production, run workers as separate processes from your main application:

```yaml
# docker-compose.yml
services:
  app:
    build: .
    command: bun run start
    
  worker:
    build: .
    command: bun run lark-jobs
    deploy:
      replicas: 3  # Run 3 worker instances
```

## Troubleshooting

### Jobs Not Processing

1. **Check Redis connection:**
   ```bash
   redis-cli ping
   # Should respond: PONG
   ```

2. **Check queue has jobs:**
   ```typescript
   const counts = await queues.default.getJobCounts()
   console.log(counts)
   ```

3. **Check worker is running:**
   ```bash
   ps aux | grep lark-jobs
   ```

### Jobs Failing Silently

Enable verbose logging in your jobs:

```typescript
class MyJob extends Job {
  async handle(payload: any) {
    this.info('Starting job with payload:', false, [payload])
    
    try {
      // Job logic
    } catch (error) {
      this.error(`Job failed: ${error.message}`)
      this.error(`Stack: ${error.stack}`)
      throw error
    }
  }
}
```

### Redis Memory Issues

If Redis is running out of memory:

1. Enable `removeOnComplete: true`
2. Set `removeOnFail: true` for non-critical jobs
3. Configure Redis `maxmemory` and eviction policy

## Next Steps

- Review [creating jobs](/lark-jobs/creating-jobs)
- Learn about [dispatching](/lark-jobs/dispatching-jobs)
- Check [configuration options](/lark/configuration)
