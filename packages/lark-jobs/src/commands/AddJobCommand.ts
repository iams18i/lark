import { Command } from '@s18i/lark'
import { Config } from '@s18i/lark'
import { writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import prompts from 'prompts'

class AddJobCommand extends Command {
  readonly key = 'job:add'
  description = 'Add a new job to the project'

  private slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }

  async handle([jobName]: string[]): Promise<boolean> {
    let commandKey: string

    if (!jobName) {
      const response = await prompts([
        {
          type: 'text',
          name: 'jobName',
          message: 'Enter the name for the new job:',
          validate: (value: string) =>
            value.length > 0 ? true : 'Job name is required',
        },
      ])

      jobName = response.jobName
    }

    if (!jobName) {
      this.error('Command name is required', true)
      return false
    }

    const defaultKey = this.slugify(jobName)

    const keyResponse = await prompts({
      type: 'text',
      name: 'commandKey',
      message: 'Enter the key for the new command (optional):',
      initial: defaultKey,
    })

    commandKey = keyResponse.commandKey || defaultKey

    const commandsPath = resolve(process.cwd(), Config.data.jobs.dir)
    const fileName = `${jobName.charAt(0).toUpperCase() + jobName.slice(1)}Job.ts`
    const filePath = resolve(commandsPath, fileName)

    if (existsSync(filePath)) {
      this.error(`Job file ${fileName} already exists`, true)
      return false
    }

    const commandContent = `import { Job } from '@s18i/lark-jobs'

class ${jobName.charAt(0).toUpperCase() + jobName.slice(1)}Job extends Job {

  async handle() {
    // Job logic here

    return true
  }
}

Job.register(${jobName.charAt(0).toUpperCase() + jobName.slice(1)}Command)

export { ${jobName.charAt(0).toUpperCase() + jobName.slice(1)}Command }
`

    try {
      writeFileSync(filePath, commandContent, 'utf8')
      this.success(`Job ${fileName} created successfully`, true)
      return true
    } catch (error) {
      this.error(
        `Failed to create job ${fileName}: ${(error as Error).message}`,
        true,
      )
      return false
    }
  }
}

Command.register(AddJobCommand)

export { AddJobCommand }
