---
slug: /
sidebar_position: 1
title: Introduction
description: Lark is a Laravel-inspired CLI and job processing framework for TypeScript. Build powerful command-line applications with background job queues powered by Bull and Redis.
keywords: [lark, typescript, cli, commands, jobs, queues, bull, redis, laravel, artisan]
---

# Lark

**A Laravel-inspired CLI and job processing framework for TypeScript.**

Lark brings the elegance and developer experience of Laravel's Artisan commands and queue system to the TypeScript/Node.js ecosystem. If you've ever loved how Laravel handles CLI commands and background jobs, you'll feel right at home with Lark.

## Why Lark?

Building CLI applications and background job processing in Node.js often means cobbling together multiple libraries, writing boilerplate code, and managing complex configurations. Lark changes that by providing:

- **Familiar Patterns** — Inspired by Laravel's Artisan commands and queue system
- **Type Safety** — Built from the ground up with TypeScript
- **Convention over Configuration** — Sensible defaults that just work
- **Unified Experience** — Commands and jobs share the same patterns and utilities

## Quick Start

Get started with a new Lark project in seconds:

```bash
npm create @s18i/lark@latest my-project
```

This will scaffold a complete project with:
- CLI command system ready to go
- Job processing with Redis-backed queues
- Docker configuration for Redis
- TypeScript configuration
- Example command and job files

## The Lark Ecosystem

Lark consists of two main packages that work seamlessly together:

### @s18i/lark

The core CLI framework for building command-line applications. Create commands with a simple class-based API, complete with built-in logging, configuration management, and argument parsing.

```typescript
import { Command } from '@s18i/lark'

class GreetCommand extends Command {
  readonly key = 'greet'
  description = 'Greet a user'

  async handle() {
    this.success('Hello from Lark!')
    return true
  }
}

Command.register(GreetCommand)
```

### @s18i/lark-jobs

A robust job processing system built on Bull and Redis. Dispatch jobs to queues, process them in the background, and handle retries automatically.

```typescript
import { Job } from '@s18i/lark-jobs'

class SendEmailJob extends Job {
  async handle(payload: { to: string; subject: string }) {
    // Send email logic here
    this.info(`Sending email to ${payload.to}`)
    return true
  }
}

Job.register(SendEmailJob)

// Dispatch the job
await new SendEmailJob().dispatch({ 
  to: 'user@example.com', 
  subject: 'Welcome!' 
})
```

## Laravel Inspiration

If you're coming from Laravel, you'll recognize these patterns:

| Laravel | Lark |
|---------|------|
| `php artisan make:command` | `bun run lark command:add` |
| `Artisan::command()` | `Command.register()` |
| `dispatch(new SendEmailJob())` | `new SendEmailJob().dispatch()` |
| `php artisan queue:work` | `bun run lark-jobs` |

## Features

- **Command System** — Class-based commands with automatic registration
- **Job Queues** — Redis-backed job processing with Bull
- **Delayed Jobs** — Schedule jobs to run after a delay
- **Retry Logic** — Automatic retries with configurable attempts
- **Multiple Queues** — Organize jobs into different queues
- **Built-in Logging** — Consistent, beautiful console output
- **TypeScript First** — Full type safety throughout

## Next Steps

Ready to get started? Head to the [Installation](/getting-started/installation) guide to create your first Lark project.
