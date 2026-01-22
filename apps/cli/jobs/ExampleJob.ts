import { Job } from '@s18i/quirk'

class ExampleJob extends Job {
  async handle<TData = string>(payload: TData): Promise<boolean> {

    // console.log('🙈 --> payload', payload)
    throw new Error(payload as string);
    
    // Implement your job handling logic here
    return true
  }
}

Job.register(ExampleJob)

export { ExampleJob }
