import Command from '../../../src/modules/Executor/Command'

describe('Executor', () => {
  it('createAndRun', done => {
    let state = 'default'

    const executor = Command.createAndRun(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          state = 'changed'
          expect(state).toBe('changed')
          resolve()
          done()
        }, 100)
      })
    })

    executor.run()
    expect(state).toBe('default')
  })

  it('resolves command asynchronously', done => {
    let state = 'default'

    // Executor takes in the `state` scope and is able to change `state` asynchronously.
    const executor = new Command(value => {
      return new Promise((resolve) => {
        setTimeout(() => {
          state = 'changed'
          expect(state).toBe('changed')
          resolve()
          done()
        }, 100)
      })
    })

    executor.run()
    expect(state).toBe('default')
  })

  it('takes multiple arguments', done => {
    const executor = new Command(
      async (one, two) => {
        expect(one).toBe('one')
        expect(two).toBe('two')
        done()
      },
    )

    executor.run('one', 'two')
  })

  it('returns whatever is returned', done => {
    const executor = new Command(async () => 'result')
    executor.run().then(result => {
      expect(result).toBe('result')
      done()
    })

    executor.run()
  })

  it('counts simultaneous runs', (done) => {
    const executor = new Command(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
    })
    Promise.all([
      executor.run(),
      executor.run(),
    ]).then(() => {
      expect(executor.isRunning).toBe(false)
      expect(executor.runCount).toBe(0)
      done()
    })
    expect(executor.isRunning).toBe(true)
    expect(executor.runCount).toBe(2)
  })
})
