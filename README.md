# Lark

**A Laravel-inspired CLI and job processing framework for TypeScript.**

Lark brings the elegance and developer experience of Laravel's Artisan commands and queue system to the TypeScript/Node.js ecosystem.

📚 **[View Full Documentation →](https://lark.s18i.io)**

## Quick Start

Create a new Lark project in seconds:

```bash
npm create @s18i/lark@latest my-project
```

Or install in an existing project:

```bash
bun add @s18i/lark @s18i/lark-jobs
```

## Features

- **Command System** — Class-based commands with automatic registration
- **Job Queues** — Redis-backed job processing with Bull
- **Delayed Jobs** — Schedule jobs to run after a delay
- **Retry Logic** — Automatic retries with configurable attempts
- **Multiple Queues** — Organize jobs into different queues
- **Built-in Logging** — Consistent, beautiful console output
- **TypeScript First** — Full type safety throughout

## Packages

- **[@s18i/lark](https://www.npmjs.com/package/@s18i/lark)** — Core CLI framework
- **[@s18i/lark-jobs](https://www.npmjs.com/package/@s18i/lark-jobs)** — Job processing system
- **[create-lark](https://www.npmjs.com/package/create-@s18i/lark)** — Project scaffolding tool

## Basic Usage

### Creating a Command

```typescript
import { Command } from '@s18i/lark'

class GreetCommand extends Command {
  readonly key = 'greet'
  description = 'Say hello'

  async handle() {
    this.success('Hello from Lark!')
    return true
  }
}

Command.register(GreetCommand)
```

### Creating a Job

```typescript
import { Job } from '@s18i/lark-jobs'

class SendEmailJob extends Job {
  async handle(payload: { to: string; subject: string }) {
    this.info(`Sending email to ${payload.to}`)
    // Your job logic here
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

## Requirements

- **Node.js** 18+ or **Bun** 1.0+
- **Redis** (for job processing)
- **TypeScript** 5.0+

## Documentation

For detailed documentation, guides, and API reference, visit:

**👉 [https://lark.s18i.io](https://lark.s18i.io)**

The documentation includes:
- Complete installation guide
- Command creation and configuration
- Job processing and queue management
- Best practices and examples
- API reference

## Development

```bash
# Install dependencies
bun install

# Start Redis (required for job processing)
docker-compose up -d

# Run the CLI
bun run lark

# Start job worker
bun run lark-jobs
```

## License

ISC

## Links

- **Documentation**: [https://lark.s18i.io](https://lark.s18i.io)
- **GitHub**: [https://github.com/iams18i/lark](https://github.com/iams18i/lark)
- **npm**: [@s18i/lark](https://www.npmjs.com/package/@s18i/lark) | [@s18i/lark-jobs](https://www.npmjs.com/package/@s18i/lark-jobs)
