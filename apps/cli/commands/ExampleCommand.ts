import { ExampleJob } from '@root/jobs/ExampleJob'
import { Command } from '@s18i/lark'

class ExampleCommand extends Command {
  readonly key = 'example'

  async handle() {
    // Command logic here
    // await new ExampleJob().dispatchNow('sync')

    await new ExampleJob().dispatch('async')

    return true
  }
}

Command.register(ExampleCommand)

export { ExampleCommand }
