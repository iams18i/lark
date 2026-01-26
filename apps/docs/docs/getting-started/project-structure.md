---
sidebar_position: 3
title: Project Structure
description: Understand the Lark project structure including commands, jobs, configuration files, and Docker setup for Redis queues.
keywords: [lark, project structure, commands directory, jobs directory, lark.config.js, docker]
---

# Project Structure

A Lark project follows a convention-over-configuration approach. Here's what each file and directory does.

## Directory Overview

```
my-project/
├── commands/           # CLI commands
│   └── ExampleCommand.ts
├── jobs/               # Background jobs
│   └── ExampleJob.ts
├── config/             # Application configuration
│   └── default.json
├── docker/             # Docker-related files
│   └── redis.conf
├── docker-compose.yml  # Docker services
├── index.ts            # CLI entry point
├── jobs.ts             # Job worker entry point
├── lark.config.js      # Lark configuration
├── package.json
└── tsconfig.json
```

## Key Files

### lark.config.js

The main configuration file for Lark. Defines where commands and jobs are located, queue settings, and Redis connection.

```javascript
export default {
  // Directory containing command files
  commands: './commands',
  
  // Job and queue configuration
  jobs: {
    queues: ['default'],      // Available queue names
    dir: './jobs',            // Directory containing job files
    options: {
      removeOnComplete: true, // Remove completed jobs from queue
      attempts: 5,            // Default retry attempts
    },
  },
  
  // Redis connection settings
  redis: {
    port: 6379,
    host: '127.0.0.1',
  },
}
```

### index.ts

The entry point for the CLI application. This file bootstraps Lark and runs commands.

```typescript
import '@s18i/lark'
```

When you run `bun run lark <command>`, this file is executed and Lark automatically:
1. Loads the configuration from `lark.config.js`
2. Discovers and registers all commands in the `commands/` directory
3. Parses CLI arguments and runs the appropriate command

### jobs.ts

The entry point for the job worker. Starts processing jobs from queues.

```typescript
import { initQueues } from '@s18i/lark-jobs'

initQueues()
```

When you run `bun run lark-jobs`, this file:
1. Loads the configuration from `lark.config.js`
2. Discovers and registers all jobs in the `jobs/` directory
3. Creates queue workers and starts processing jobs

## Directory Details

### commands/

Contains all your CLI commands. Each command is a TypeScript file that exports a class extending `Command`.

```
commands/
├── ExampleCommand.ts
├── UserCommands/
│   ├── CreateUserCommand.ts
│   └── DeleteUserCommand.ts
└── DataCommands/
    └── ImportCommand.ts
```

Commands are auto-discovered, so you can organize them in subdirectories.

### jobs/

Contains all your background jobs. Each job is a TypeScript file that exports a class extending `Job`.

```
jobs/
├── ExampleJob.ts
├── EmailJobs/
│   ├── SendWelcomeEmailJob.ts
│   └── SendNotificationJob.ts
└── DataJobs/
    └── ProcessImportJob.ts
```

Jobs are auto-discovered, so you can organize them in subdirectories.

### config/

Application configuration using [node-config](https://github.com/node-config/node-config). Supports environment-specific overrides.

```
config/
├── default.json      # Default configuration
├── development.json  # Development overrides
├── production.json   # Production overrides
└── local.json        # Local overrides (git-ignored)
```

Access configuration in your code:

```typescript
import config from 'config'

const apiKey = config.get('api.key')
const timeout = config.get('timeout')
```

## Package Scripts

The scaffolded `package.json` includes these scripts:

```json
{
  "scripts": {
    "start": "bun run index.ts",
    "lark-jobs": "bun run jobs.ts",
    "build": "tsc",
    "dev": "tsc -w",
    "test": "jest"
  }
}
```

- **start** — Run the CLI (`bun run lark <command>` is shorthand for this)
- **lark-jobs** — Start the job worker
- **build** — Compile TypeScript
- **dev** — Watch mode for TypeScript compilation
- **test** — Run tests

## Docker Services

The `docker-compose.yml` sets up Redis for job queue persistence:

```yaml
services:
  redis_lark_jobs:
    image: redis:latest
    container_name: redis_lark_jobs
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
      - ./docker/redis.conf:/usr/local/etc/redis/redis.conf
```

Start Redis with:

```bash
docker-compose up -d
```

## Next Steps

- Learn more about [Commands](/lark/commands)
- Explore [Configuration Options](/lark/configuration)
- Understand [Job Processing](/lark-jobs/overview)
