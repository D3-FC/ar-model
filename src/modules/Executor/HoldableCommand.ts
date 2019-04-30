import Command from './Command'

/**
 * This command won't let you execute 2 runs simultaneously.
 * Busy requests will get infinite promise.
 */
export default class HoldableCommand extends Command {
  promise: Promise<any> | null = null

  async run (...parameters: any[]): Promise<any> {
    if (!this.isRunning) {
      this.promise = super.run(...parameters)
      return this.promise
    }
  }
}
