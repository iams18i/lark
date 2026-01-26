---
sidebar_position: 1
title: Installation
description: Get started with Lark in minutes using npm create @s18i/lark. Learn how to install and set up the Laravel-inspired CLI and job processing framework for TypeScript.
keywords: [lark, installation, npm create, typescript, cli, setup, getting started]
---

# Installation

Get started with Lark in minutes. The easiest way to create a new Lark project is using the `create-lark` scaffolding tool.

## Create a New Project

Run the following command to create a new Lark project:

```bash
npm create @s18i/lark@latest my-project
```

Or using other package managers:

```bash
# Using yarn
yarn create @s18i/lark my-project

# Using pnpm
pnpm create @s18i/lark my-project

# Using bun
bun create @s18i/lark my-project
```

The scaffolding tool will prompt you for:
- **Project name** — The name of your project directory
- **Description** — A brief description of your project
- **Initialize git** — Whether to initialize a git repository

## What's Included

After scaffolding, your project will include:

```
my-project/
├── commands/
│   └── ExampleCommand.ts    # Example CLI command
├── jobs/
│   └── ExampleJob.ts        # Example background job
├── config/
│   └── default.json         # Application configuration
├── docker/
│   └── redis.conf           # Redis configuration
├── docker-compose.yml       # Docker services (Redis)
├── index.ts                 # CLI entry point
├── jobs.ts                  # Job worker entry point
├── lark.config.js           # Lark configuration
├── package.json
└── tsconfig.json
```

## Start the Development Environment

1. **Install dependencies:**

```bash
cd my-project
bun install
```

2. **Start Redis** (required for job processing):

```bash
docker-compose up -d
```

3. **Run a command:**

```bash
bun run lark example
```

4. **Start the job worker** (in a separate terminal):

```bash
bun run lark-jobs
```

## Manual Installation

If you prefer to add Lark to an existing project, install the packages directly:

```bash
# Install the CLI framework
bun add @s18i/lark

# Install the job processing system (optional)
bun add @s18i/lark-jobs
```

Then create a `lark.config.js` file in your project root:

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

## Requirements

- **Node.js** 18+ or **Bun** 1.0+
- **Redis** (for job processing)
- **TypeScript** 5.0+

## Next Steps

Now that you have Lark installed, check out the [Quick Start](/getting-started/quick-start) guide to create your first command and job.
