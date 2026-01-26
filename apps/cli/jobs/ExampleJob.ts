import { Job } from '@s18i/lark-jobs'

interface TestInter {
  tesd: string
}

class ExampleJob extends Job {
  async handle(payload: TestInter): Promise<boolean> {
    // console.log('🙈 --> payload', payload)
    throw payload

    // Implement your job handling logic here
    return true
  }
}

Job.register(ExampleJob)

export { ExampleJob }
