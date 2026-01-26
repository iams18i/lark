---
sidebar_position: 2
title: Creating Commands
description: Learn how to create CLI commands in Lark. Includes command structure, logging methods, registration, and practical examples.
keywords: [lark, commands, cli, typescript, create command, Command class, register]
---

# Commands

Commands are the core building blocks of a Lark CLI application. Each command is a TypeScript class that extends the `Command` base class.

## Creating a Command

### Basic Structure

```typescript
import { Command } from '@s18i/lark'

class MyCommand extends Command {
  // Required: unique identifier for the command
  readonly key = 'my-command'
  
  // Optional: description shown in help
  description = 'Does something useful'

  // Required: main execution logic
  async handle(): Promise<boolean> {
    // Your command logic here
    return true
  }
}

// Register the command
Command.register(MyCommand)

export { MyCommand }
```

### The `key` Property

The `key` is the identifier used to run your command from the CLI:

```typescript
readonly key = 'process-users'
```

```bash
bun run lark process-users
```

Use kebab-case for consistency. You can also use colons for namespaced commands:

```typescript
readonly key = 'user:create'
```

```bash
bun run lark user:create
```

### The `description` Property

An optional description shown when listing commands:

```typescript
description = 'Create a new user in the database'
```

### The `handle` Method

The `handle` method contains your command's execution logic. It should return:
- `true` on success
- `false` on failure

```typescript
async handle(): Promise<boolean> {
  try {
    // Do work
    this.success('Operation completed')
    return true
  } catch (error) {
    this.error(`Failed: ${error.message}`)
    return false
  }
}
```

## Logging Methods

Commands have built-in logging methods powered by [Consola](https://github.com/unjs/consola):

### `this.info(message)`

Display an informational message:

```typescript
this.info('Processing started...')
// ℹ Processing started...
```

### `this.success(message)`

Display a success message:

```typescript
this.success('All done!')
// ✔ All done!
```

### `this.error(message)`

Display an error message:

```typescript
this.error('Something went wrong')
// ✖ Something went wrong
```

### Badges

You can display messages with badges by passing `true` as the second argument:

```typescript
this.info('Starting', true)
// [INFO] Starting
```

## Command Registration

Every command must be registered to be discoverable:

```typescript
Command.register(MyCommand)
```

This adds your command to the global command registry. When Lark starts, it loads all files in the `commands/` directory, and registered commands become available.

## Example Commands

### Simple Command

```typescript
import { Command } from '@s18i/lark'

class GreetCommand extends Command {
  readonly key = 'greet'
  description = 'Greet the user'

  async handle() {
    this.success('Hello! Welcome to Lark.')
    return true
  }
}

Command.register(GreetCommand)
export { GreetCommand }
```

### Command with External Dependencies

```typescript
import { Command } from '@s18i/lark'
import config from 'config'

class SyncDataCommand extends Command {
  readonly key = 'sync-data'
  description = 'Sync data from external API'

  async handle() {
    const apiUrl = config.get('api.url')
    
    this.info(`Connecting to ${apiUrl}...`)
    
    try {
      const response = await fetch(apiUrl)
      const data = await response.json()
      
      this.info(`Received ${data.length} records`)
      
      // Process data...
      
      this.success('Sync completed')
      return true
    } catch (error) {
      this.error(`Sync failed: ${error.message}`)
      return false
    }
  }
}

Command.register(SyncDataCommand)
export { SyncDataCommand }
```

### Command that Dispatches Jobs

```typescript
import { Command } from '@s18i/lark'
import { ProcessUserJob } from '../jobs/ProcessUserJob'

class ProcessUsersCommand extends Command {
  readonly key = 'process-users'
  description = 'Queue user processing jobs'

  async handle() {
    const userIds = [1, 2, 3, 4, 5]
    
    this.info(`Queueing ${userIds.length} jobs...`)
    
    for (const userId of userIds) {
      await new ProcessUserJob().dispatch({ userId })
    }
    
    this.success(`Queued ${userIds.length} jobs for processing`)
    return true
  }
}

Command.register(ProcessUsersCommand)
export { ProcessUsersCommand }
```

## Organizing Commands

You can organize commands into subdirectories. Lark will recursively discover all command files:

```
commands/
├── UserCommands/
│   ├── CreateUserCommand.ts
│   ├── DeleteUserCommand.ts
│   └── ListUsersCommand.ts
├── DataCommands/
│   ├── ImportCommand.ts
│   └── ExportCommand.ts
└── HealthCheckCommand.ts
```

## API Reference

### Command Class

```typescript
abstract class Command {
  // Required: unique command identifier
  abstract readonly key: string
  
  // Optional: command description
  description: string = ''
  
  // Required: main execution logic
  abstract handle(...args: any[]): Promise<boolean> | boolean
  
  // Logging methods
  info(message: string, badge?: boolean): void
  success(message: string, badge?: boolean): void
  error(message: string, badge?: boolean): void
  
  // Static registration
  static register(command: any): void
}
```

## Next Steps

- Configure Lark with [lark.config.js](/lark/configuration)
- Add background processing with [Lark Jobs](/lark-jobs/overview)
