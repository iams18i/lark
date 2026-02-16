#!/usr/bin/env bun

export { Command } from './Command'
export { Config } from './config'

import { Command as CommanderCommand } from 'commander'
import { readFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { Config } from './config'
import consola from 'consola'

// Import the InitCommand and AddCommand
import './commands/InitCommand'
import './commands/AddCommand'

// Optional: register job:add command if @s18i/lark-jobs is installed
try {
  require.resolve('@s18i/lark-jobs')
  require('@s18i/lark-jobs/src/commands/AddJobCommand')
} catch {
  // @s18i/lark-jobs not installed, skip
}

const program = new CommanderCommand()
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
)

// Load the configuration
Config.load()

program.version(packageJson.version).description('Lark')

// Use the configuration to dynamically load commands
if (Config.data.commands) {
  const commandsPath = resolve(process.cwd(), Config.data.commands)
  try {
    const commandFiles = readdirSync(commandsPath).filter(
      (file) => file.endsWith('.ts') || file.endsWith('.js'),
    )
    for (const file of commandFiles) {
      require(join(commandsPath, file))
    }
  } catch (error) {
    consola.error({
      message: `Error loading commands: ${(error as Error).message}`,
      badge: true,
    })
  }
}

// Iterate over Config.commands and register them with the program
for (const [commandKey, CommandClass] of Object.entries(Config.commands)) {
  const commandInstance = new CommandClass()
  program
    .command(commandKey)
    .description(commandInstance.description)
    .action(async (...args: any[]): Promise<any> => {
      try {
        const data = await commandInstance.handle(args?.[1]?.args)
        // ToDo: improve
        return data
      } catch (error) {
        consola.error({
          message: `Error executing command ${commandKey}: ${(error as Error).message}`,
          badge: true,
        })
      }
    })
}

program.parse(process.argv)
