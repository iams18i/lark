---
sidebar_position: 2
title: Quick Start
description: Create your first Lark command and background job. Learn the basics of building CLI applications with TypeScript in minutes.
keywords: [lark, quick start, tutorial, first command, first job, typescript, cli]
---

# Quick Start

This guide will walk you through creating your first command and job with Lark.

## Prerequisites

Make sure you have:
- A Lark project set up (see [Installation](/getting-started/installation))
- Dependencies installed (`bun install`)
- Redis running (`docker-compose up -d`)

## Creating Your First Command

Commands are the building blocks of your CLI application. Let's create a simple "hello" command.

### Using the Command Generator

The easiest way to create a command is using the built-in generator:

```bash
bun run lark command:add
```

This will prompt you for:
1. **Command name** — e.g., "hello"
2. **Command key** — The CLI identifier (defaults to slugified name)

### Manual Command Creation

Create a new file `commands/HelloCommand.ts`:

```typescript
import { Command } from '@s18i/lark'

class HelloCommand extends Command {
  readonly key = 'hello'
  description = 'Say hello to someone'

  async handle() {
    this.info('Starting the hello command...')
    
    // Your command logic here
    this.success('Hello, World!')
    
    return true
  }
}

Command.register(HelloCommand)

export { HelloCommand }
```

### Running Your Command

Run your new command:

```bash
bun run lark hello
```

You should see:

```
ℹ Starting the hello command...
✔ Hello, World!
```

## Creating Your First Job

Jobs are background tasks that run asynchronously. Let's create a job that processes data.

### Create the Job File

Create a new file `jobs/ProcessDataJob.ts`:

```typescript
import { Job } from '@s18i/lark-jobs'

interface ProcessDataPayload {
  userId: number
  action: string
}

class ProcessDataJob extends Job {
  // Optional: specify a different queue
  queueName = 'default'
  
  // Optional: number of retry attempts
  attempts = 3

  async handle(payload: ProcessDataPayload): Promise<boolean> {
    this.info(`Processing data for user ${payload.userId}`)
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    this.success(`Completed action: ${payload.action}`)
    return true
  }
}

Job.register(ProcessDataJob)

export { ProcessDataJob }
```

### Dispatching Jobs

You can dispatch jobs from anywhere in your application, including from commands:

```typescript
import { Command } from '@s18i/lark'
import { ProcessDataJob } from '../jobs/ProcessDataJob'

class TriggerJobCommand extends Command {
  readonly key = 'trigger-job'
  description = 'Dispatch a background job'

  async handle() {
    this.info('Dispatching job to queue...')
    
    // Dispatch to queue (processed by worker)
    await new ProcessDataJob().dispatch({
      userId: 123,
      action: 'sync-profile'
    })
    
    this.success('Job dispatched!')
    return true
  }
}

Command.register(TriggerJobCommand)
```

### Running the Job Worker

Start the job worker to process queued jobs:

```bash
bun run lark-jobs
```

The worker will pick up jobs from the queue and process them.

### Dispatching Jobs Immediately

If you need to run a job immediately without queueing:

```typescript
// Execute immediately (bypasses the queue)
await new ProcessDataJob().dispatchNow({
  userId: 123,
  action: 'urgent-sync'
})
```

## Working with Delayed Jobs

You can schedule jobs to run after a delay:

```typescript
const job = new ProcessDataJob()
job.delay = 5000 // 5 seconds in milliseconds

await job.dispatch({
  userId: 123,
  action: 'delayed-action'
})
```

## Using the Built-in Logging

Both commands and jobs have built-in logging methods:

```typescript
// Information message
this.info('Processing...')

// Success message
this.success('Done!')

// Error message
this.error('Something went wrong')
```

## Next Steps

- Learn more about [Commands](/lark/commands)
- Explore [Job Configuration](/lark-jobs/creating-jobs)
- Understand the [Project Structure](/getting-started/project-structure)
