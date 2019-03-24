import { LaravelApi } from '../../../src/modules/Api/LaravelApi'
import { ApiInstance, ApiRequestConfig, ApiResponse } from '../../../src/modules/Api/ConfigTypes'
import { NetworkError } from '../../../src/modules/Error/NetworkError'
import { expectThrow } from '../../../src/modules/Helper/TestHelpers'
import { UnauthorizedError } from '../../../src/modules/Error/UnauthorizedError'
import { NotFoundError } from '../../../src/modules/Error/NotFoundError'
import { ApiError } from '../../../src/modules/Error/ApiError'

describe('LaravelApi', () => {
  class AxiosMock implements ApiInstance {
    defaults!: ApiRequestConfig

    async delete (url: string, config?: ApiRequestConfig): Promise<any> {
    }

    async post (url: string, data?: any, config?: ApiRequestConfig): Promise<any> {
    }

    async put (url: string, data?: any, config?: ApiRequestConfig): Promise<any> {
    }

    async get (url: string, config?: ApiRequestConfig): Promise<any> {

    }
  }

  describe('handleAction ', () => {
    const api = new LaravelApi(new AxiosMock())

    describe(' should throw UnauthorizedError error', async () => {
      class CustomError extends Error {
        response = {
          status: 401,
          data: {
            error: 'error unique number',
            message: 'custom message',
            data: { id: 1 }
          }
        }
      }
      test('error instance should be UnauthorizedError', async () => {
        await expectThrow(() => api.handleAction(() => {
          throw new CustomError('CustomError')
        }), UnauthorizedError)
      })
      test('UnauthorizedError format should be valid', async () => {
        try {
          await api.handleAction(() => {
            throw new CustomError('CustomError')
          })
        } catch (e) {
          expect(e.error).toEqual('error unique number')
          expect(e.message).toEqual('Unauthenticated') // UnauthorizedError default message
          expect(e.description).toEqual('custom message') // Comes from api message key
          expect(e.data).toEqual({ id: 1 })
        }
      })
    })

    describe(' should throw NotFoundError error', async () => {
      class CustomError extends Error {
        response = {
          status: 404,
          data: {
            data: { id: 1 }
          }
        }
      }
      test('error instance should be NotFoundError', async () => {
        await expectThrow(() => api.handleAction(() => {
          throw new CustomError('CustomError')
        }), NotFoundError)
      })
      test('UnauthorizedError format should be valid', async () => {
        try {
          await api.handleAction(() => {
            throw new CustomError('CustomError')
          })
        } catch (e) {
          expect(e.data).toEqual({ id: 1 })
        }
      })
    })

    describe(' should throw ApiError error', async () => {
      class CustomError extends Error {
        response = {
          status: 500, // [any, !401, !404]
          data: {
            message: 'custom message',
          }
        }
      }
      test('error instance should be ApiError', async () => {
        await expectThrow(() => api.handleAction(() => {
          throw new CustomError('CustomError')
        }), ApiError)
      })
      test('UnauthorizedError format should be valid', async () => {
        try {
          await api.handleAction(() => {
            throw new CustomError('CustomError')
          })
        } catch (e) {
          expect(e.message).toEqual('custom message')
        }
      })
    })

    test(' should throw network error error', async () => {
      await expectThrow(() => api.handleAction(() => {
        throw new Error('Network Error')
      }), NetworkError)
    })
    test('should return given in cb data', async () => {
      const result = await api.handleAction(() => {
        return 'response'
      })
      expect(result).toBe('response')
    })
    test('should return given in cb data without wrapper "data"', async () => {
      const result = await api.handleAction(() => {
        return {
          data: 'response'
        }
      })
      expect(result).toBe('response')
    })
  })

  test('get should set mock with appropriate data format', async () => {
    const api = new LaravelApi(new AxiosMock())
    let expectedAxiosGetParasm: any[] = [];
    (api as any).api.get = (...args: any[]) => {
      expectedAxiosGetParasm = args
    }
    await api.get('/test', { filter: 'search' }, { timeout: 1 })
    expect(expectedAxiosGetParasm[0]).toBe('/test')
    expect(expectedAxiosGetParasm[1].timeout).toBe(1)
    expect(expectedAxiosGetParasm[1].params).toEqual({ filter: 'search' })
  })

  test('delete should set mock with appropriate data format', async () => {
    const api = new LaravelApi(new AxiosMock())
    let expectedAxiosDeleteParasm: any[] = [];
    (api as any).api.delete = (...args: any[]) => {
      expectedAxiosDeleteParasm = args
    }
    const payload = { id: 1 }
    await api.delete('/test', payload)
    expect(expectedAxiosDeleteParasm[0]).toBe('/test')
    expect(expectedAxiosDeleteParasm[1]).toEqual(payload)
  })

  test('post should set mock with appropriate data format', async () => {
    const api = new LaravelApi(new AxiosMock())
    let expectedAxiosDeleteParasm: any[] = [];
    (api as any).api.post = (...args: any[]) => {
      expectedAxiosDeleteParasm = args
    }
    const payload = { id: 1 }
    const config = { timeout: 1 }
    await api.post('/test', payload, config)
    expect(expectedAxiosDeleteParasm[0]).toBe('/test')
    expect(expectedAxiosDeleteParasm[1]).toEqual(payload)
    expect(expectedAxiosDeleteParasm[2]).toEqual(config)
  })

  test('put should set mock with appropriate data format', async () => {
    const api = new LaravelApi(new AxiosMock())
    let expectedAxiosDeleteParasm: any[] = [];
    (api as any).api.put = (...args: any[]) => {
      expectedAxiosDeleteParasm = args
    }
    const payload = { id: 1 }
    const config = { timeout: 1 }
    await api.put('/test', payload, config)
    expect(expectedAxiosDeleteParasm[0]).toBe('/test')
    expect(expectedAxiosDeleteParasm[1]).toEqual(payload)
    expect(expectedAxiosDeleteParasm[2]).toEqual(config)
  })
})
