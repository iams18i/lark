---
sidebar_position: 1
title: Lark CLI Overview
description: Learn about the @s18i/lark CLI framework - a class-based command system inspired by Laravel Artisan for TypeScript applications.
keywords: [lark, cli, command system, artisan, typescript, framework, overview]
---

# Lark CLI Overview

`@s18i/lark` is the core CLI framework that powers Lark applications. It provides a class-based command system inspired by Laravel's Artisan.

## Features

- **Class-based Commands** — Define commands as TypeScript classes
- **Auto-discovery** — Commands are automatically loaded from your configured directory
- **Built-in Logging** — Consistent, beautiful console output
- **Configuration Management** — Centralized configuration with `lark.config.js`
- **Argument Parsing** — Built on Commander.js for robust CLI argument handling

## How It Works

When you run a Lark command:

```bash
bun run lark my-command
```

Lark performs these steps:

1. **Load Configuration** — Reads `lark.config.js` from your project root
2. **Discover Commands** — Scans the configured `commands` directory
3. **Register Commands** — Makes all discovered commands available
4. **Parse Arguments** — Uses Commander.js to parse CLI arguments
5. **Execute Command** — Runs the matching command's `handle()` method

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLI Input                          │
│                   bun run lark hello                    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    Lark Core                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Config    │  │   Command    │  │    Logger    │  │
│  │   Manager    │  │   Registry   │  │   (Consola)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Your Command                           │
│              HelloCommand.handle()                      │
└─────────────────────────────────────────────────────────┘
```

## Installation

```bash
bun add @s18i/lark
```

## Basic Usage

Create a command file in your `commands/` directory:

```typescript
import { Command } from '@s18i/lark'

class HelloCommand extends Command {
  readonly key = 'hello'
  description = 'Say hello'

  async handle() {
    this.success('Hello, World!')
    return true
  }
}

Command.register(HelloCommand)

export { HelloCommand }
```

Run it:

```bash
bun run lark hello
# ✔ Hello, World!
```

## Built-in Commands

Lark includes these commands out of the box:

### `init`

Creates a new `lark.config.js` file in your project:

```bash
bun run lark init
```

### `command:add`

Interactive command generator:

```bash
bun run lark command:add
```

Prompts for:
- Command name
- Command key (CLI identifier)

## Next Steps

- Learn how to [create commands](/lark/commands)
- Explore [configuration options](/lark/configuration)
