import HoldExecutor from '../../../src/modules/Executor/HoldExecutor'
import { sleep } from '../../../src/modules/Helper/AsyncHelpers'

describe('HoldExecutor', () => {
  it('should run command only once', async (done) => {
    let runsCount = 0
    const executor = new HoldExecutor(async () => {
      runsCount++
      await sleep(5)
      return runsCount
    })

    const firstRun = await executor.run()
    expect(firstRun).toBe(1)

    const secondRun = await executor.run()
    expect(firstRun).toBe(1)

    const thirdRun = await executor.run()
    expect(firstRun).toBe(1)

    Promise.all([firstRun, secondRun, thirdRun]).then(() => done())
  })
})
