import { ApiContract } from './ApiContract'
import { Dao } from '../DAO/Dao'
import { ConfigContract } from './ConfigContract'
import { ValidationError } from '../Error/Validation/ValidationError'
import { UnauthorizedError } from '../Error/UnauthorizedError'
import { NotFoundError } from '../Error/NotFoundError'
import { NetworkError } from '../Error/NetworkError'
import { ApiError } from '../Error/ApiError'

export class LaravelProxy implements ApiContract {
  api: ApiContract

  constructor (api: ApiContract) {
    this.api = api
  }

  async delete (url: string, data?: Dao, config?: ConfigContract): Promise<void> {
    await this.handleExceptions(() => this.api.delete(url, data))
  }

  async get (url: string, data?: Dao, config?: ConfigContract): Promise<any> {
    return this.handleExceptions(() => this.api.get(url, data), config && config.noWrapper)
  }

  async post (url: string, data?: Dao, config?: ConfigContract): Promise<any> {
    return this.handleExceptions(() => this.api.post(url, data, config), config && config.noWrapper)
  }

  async put (url: string, data?: Dao, config?: ConfigContract): Promise<any> {
    return this.handleExceptions(() => this.api.put(url, data, config), config && config.noWrapper)
  }

  setToken (token: string): void {
    this.api.setToken(token)
  }

  // TODO: decouple with axios response. Make proxy exception.
  async handleExceptions (cb: Function, noWrapper: boolean = false) {
    let response = null
    try {
      response = await cb()
    } catch (exception) {
      const exceptionResponse = exception && exception.response
      const data = exceptionResponse && exceptionResponse.data
      const status = exceptionResponse && exceptionResponse.status

      if (ValidationError.isValidationError(exception)) {
        throw ValidationError.createFromLaravelError(exception)
      }
      if (status === 401) {
        throw new UnauthorizedError({
          error: data.error,
          description: data.message,
          previous: exception,
          data: data.data
        })
      }
      if (status === 404) {
        throw new NotFoundError({
          previous: exception,
          data: data.data
        })
      }
      if (exception.response) {
        throw new ApiError({
          message: data.message
        })
      }
      throw exception
    }
    if (noWrapper) {
      return response
    }
    return response && response.data
  }
}
