import Executor from './Executor'

/**
 * This executor won't let you execute 2 runs simultaneously.
 * Busy requests will get infinite promise.
 */
export default class HoldExecutor extends Executor {
  async run (...parameters: any[]): Promise<any> {
    if (!this.isRunning) {
      return super.run(...parameters)
    }
  }
}
