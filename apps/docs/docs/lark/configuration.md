---
sidebar_position: 3
title: Configuration
description: Configure your Lark application using lark.config.js. Learn about commands, jobs, queues, and Redis settings.
keywords: [lark, configuration, lark.config.js, config, redis, queues, settings]
---

# Configuration

Lark uses a centralized configuration file (`lark.config.js`) and supports environment-specific application configuration through [node-config](https://github.com/node-config/node-config).

## lark.config.js

The main Lark configuration file. Place it in your project root.

### Full Example

```javascript
export default {
  // Directory containing command files
  commands: './commands',
  
  // Job and queue configuration
  jobs: {
    // List of queue names to create
    queues: ['default', 'high-priority', 'low-priority'],
    
    // Directory containing job files
    dir: './jobs',
    
    // Default Bull queue options
    options: {
      removeOnComplete: true,
      attempts: 5,
    },
  },
  
  // Redis connection settings
  redis: {
    port: 6379,
    host: '127.0.0.1',
    password: undefined, // Optional
  },
}
```

### Configuration Options

#### `commands`

Path to the directory containing your command files. Relative to the project root.

```javascript
commands: './commands'
// or
commands: './src/commands'
```

#### `jobs.queues`

Array of queue names to create. Jobs specify which queue they belong to via the `queueName` property.

```javascript
jobs: {
  queues: ['default', 'emails', 'reports']
}
```

#### `jobs.dir`

Path to the directory containing your job files. Relative to the project root.

```javascript
jobs: {
  dir: './jobs'
  // or
  dir: './src/jobs'
}
```

#### `jobs.options`

Default [Bull queue options](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue) applied to all jobs.

```javascript
jobs: {
  options: {
    removeOnComplete: true,  // Remove job from queue on completion
    removeOnFail: false,     // Keep failed jobs for debugging
    attempts: 5,             // Number of retry attempts
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  }
}
```

#### `redis`

Redis connection configuration for job queues.

```javascript
redis: {
  host: '127.0.0.1',
  port: 6379,
  password: 'your-password', // Optional
  db: 0,                     // Optional: Redis database number
}
```

## Accessing Configuration

The `Config` class provides access to the loaded configuration:

```typescript
import { Config } from '@s18i/lark'

// Load configuration (usually done automatically)
Config.load()

// Access configuration data
const commands = Config.data.commands
const redisHost = Config.data.redis.host

// Access registered commands
const allCommands = Config.commands

// Access registered jobs
const allJobs = Config.jobs

// Access queue names
const queueNames = Config.queues
```

## Application Configuration

For application-specific configuration (API keys, feature flags, etc.), use the `config/` directory with [node-config](https://github.com/node-config/node-config).

### Directory Structure

```
config/
├── default.json      # Default values
├── development.json  # Development overrides
├── production.json   # Production overrides
├── test.json         # Test environment
└── local.json        # Local overrides (git-ignored)
```

### Example: default.json

```json
{
  "api": {
    "url": "https://api.example.com",
    "timeout": 5000
  },
  "features": {
    "newDashboard": false
  }
}
```

### Example: production.json

```json
{
  "api": {
    "url": "https://api.production.example.com"
  },
  "features": {
    "newDashboard": true
  }
}
```

### Using Configuration in Code

```typescript
import config from 'config'

// Get a value
const apiUrl = config.get('api.url')

// Check if a key exists
if (config.has('features.newDashboard')) {
  const isEnabled = config.get('features.newDashboard')
}
```

### Environment-Specific Loading

Configuration files are loaded based on `NODE_ENV`:

```bash
# Loads: default.json + development.json
NODE_ENV=development bun run lark my-command

# Loads: default.json + production.json
NODE_ENV=production bun run lark my-command
```

### Local Overrides

Create a `config/local.json` for machine-specific settings. This file should be git-ignored:

```json
{
  "api": {
    "key": "your-local-api-key"
  },
  "redis": {
    "host": "localhost"
  }
}
```

## Environment Variables

You can use environment variables via a `.env` file. Install the `dotenv` package:

```bash
bun add dotenv
```

Load it at the start of your entry files:

```typescript
import 'dotenv/config'
import '@s18i/lark'
```

Then reference environment variables in your configuration:

```javascript
// lark.config.js
export default {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
}
```

## Configuration Precedence

Configuration is merged in this order (later overrides earlier):

1. `lark.config.js` — Lark-specific settings
2. `config/default.json` — Default application config
3. `config/{NODE_ENV}.json` — Environment-specific config
4. `config/local.json` — Local machine overrides
5. Environment variables — Runtime overrides

## Next Steps

- Learn about [Lark Jobs](/lark-jobs/overview)
- Create [Commands](/lark/commands)
