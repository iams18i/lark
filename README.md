# Commander

A powerful CLI and job processing framework built with TypeScript. Commander provides a robust foundation for building command-line applications with built-in support for background job processing, configuration management, and extensible command system.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/iams18i/commander.git
cd commander

# Install dependencies
bun install

# Start Redis (required for job processing)
docker-compose up -d

# Run the CLI
bun run lark
```

That's it! You can now start creating commands and jobs.

## Project Structure

```
.
├── apps/
│   └── cli/           # CLI application
│       ├── commands/  # CLI commands
│       ├── config/    # Configuration files
│       └── jobs/      # Job definitions
├── packages/
│   ├── lark/         # Core framework
│   └── lark-jobs/        # Job processing system
└── docker/           # Docker configuration
```

## Configuration System

The project uses a multi-layered configuration system:

### 1. Project Configuration (`lark.config.js`)

The main configuration file that defines the project structure and settings:

```javascript
export default {
  commands: './commands',
  jobs: {
    queues: ['default'],
    dir: './jobs',
    options: {
      removeOnComplete: true,
      attempts: 5,
    },
  },
  redis: {
    port: 6379,
    host: '127.0.0.1',
  },
}
```

### 2. Application Configuration (`apps/cli/config/`)

The CLI application uses [nodeconfig](https://github.com/node-config/node-config) for environment-specific configuration:

```
apps/cli/config/
├── default.json      # Default configuration
├── development.json  # Development environment overrides
├── production.json   # Production environment overrides
├── test.json        # Test environment overrides
└── local.json       # Local development overrides (git-ignored)
```

Configuration files are loaded in the following order (later files override earlier ones):

1. `default.json` - Base configuration
2. `{NODE_ENV}.json` - Environment-specific configuration
3. `local.json` - Local development overrides (not committed to git)

For more details about configuration loading, file formats, and environment variables, see the [nodeconfig documentation](https://github.com/node-config/node-config/wiki/Configuration-Files).

To use configuration in your commands or jobs:

```typescript
import config from 'config'

// Access configuration values
const apiKey = config.get('api.key')
const timeout = config.get('timeout', 5000) // with default value
```

#### Local Configuration

The `local.json` file is used for local development settings and is git-ignored. This allows developers to:

- Override sensitive values (API keys, passwords)
- Set local-specific settings
- Maintain different configurations across team members

Example `local.json`:

```json
{
  "api": {
    "key": "your-local-api-key",
    "endpoint": "http://localhost:3000"
  },
  "redis": {
    "host": "localhost",
    "port": 6379
  }
}
```

### 3. Environment Variables

Environment-specific settings can be overridden using `.env` files:

```bash
# .env
REDIS_HOST=localhost
REDIS_PORT=6379
API_KEY=your-api-key
```

## Creating New Commands

Commands are the building blocks of the CLI application. They are located in the `apps/cli/commands` directory.

### Using the Command Generator

The easiest way to create a new command is to use the built-in command generator:

```bash
bun run lark command:add
```

This will prompt you for:

1. Command name (e.g., "process-files")
2. Command key (optional, defaults to slugified command name)

### Manual Command Creation

You can also create commands manually by creating a new file in `apps/cli/commands/`:

```typescript
import { Command } from '@s18i/lark'

class MyCommand extends Command {
  readonly key = 'my-command' // This will be the command name in CLI
  description = 'Description of what my command does'

  async handle() {
    // Your command logic here
    return true
  }
}

Command.register(MyCommand)

export { MyCommand }
```

### Command Features

- **Key**: Unique identifier for the command (used in CLI)
- **Description**: Optional description of the command
- **Handle Method**: Main execution logic
- **Built-in Logging**: Use `this.info()`, `this.error()`, and `this.success()` for logging

## Creating New Jobs

Jobs are background tasks that can be processed asynchronously. They are located in the `apps/cli/jobs` directory.

### Basic Job Structure

```typescript
import { Job } from '@s18i/lark-jobs'

class MyJob extends Job {
  // Optional: Override default queue name
  queueName = 'custom-queue'

  // Optional: Override default retry attempts
  attempts = 3

  async handle(): Promise<boolean> {
    // Your job logic here
    return true
  }
}

Job.register(MyJob)

export { MyJob }
```

### Job Features

- **Queue Name**: Specify which queue to use (defaults to 'default')
- **Retry Attempts**: Number of times to retry failed jobs (defaults to 5)
- **Delay**: Add delay before job execution (in milliseconds)
- **Handle Method**: Main job processing logic

### Dispatching Jobs

From within a command or another job:

```typescript
// Dispatch to queue
await new MyJob().dispatch()

// Execute immediately
await new MyJob().dispatchNow()
```

## Development

1. Install dependencies:

   ```bash
   bun install
   ```

2. Start Redis (required for job processing):

   ```bash
   docker-compose up -d
   ```

3. Run the CLI:
   ```bash
   bun run lark
   ```

## Available Commands

- `command:add` - Create a new command
- `init` - Initialize project configuration

## Best Practices

1. **Commands**:

   - Keep commands focused on a single responsibility
   - Use descriptive names and keys
   - Handle errors gracefully
   - Use built-in logging methods

2. **Jobs**:

   - Make jobs idempotent when possible
   - Use appropriate queue names for different job types
   - Set reasonable retry attempts
   - Handle errors and edge cases

3. **General**:
   - Follow TypeScript best practices
   - Write clear documentation
   - Use meaningful variable and function names
   - Test your commands and jobs thoroughly
