import { ApiContract } from './ApiContract'
import { Dao } from '../DAO/Dao'
import { ApiProxyError, ApiInstance, ApiRequestConfig } from './ConfigTypes'
import { ApiError } from '../Error/ApiError'
import { NetworkError } from '../Error/NetworkError'
import { ValidationError } from '../Error/Validation/ValidationError'
import { UnauthorizedError } from '../Error/UnauthorizedError'
import { NotFoundError } from '../Error/NotFoundError'

export class LaravelApi implements ApiContract {
  api: ApiInstance

  constructor (api: ApiInstance) {
    this.api = api
  }

  async delete (url: string, data?: Dao): Promise<any> {
    return this.handleAction(() => this.api.delete(url, data))
  }

  async get (url: string, data?: Dao, config?: ApiRequestConfig): Promise<any> {
    return this.handleAction(() => this.api.get(url, {
      ...config,
      params: data
    }))
  }

  async post (url: string, data?: Dao, config?: ApiRequestConfig): Promise<any> {
    return this.handleAction(() => this.post(url, data, config))
  }

  async put (url: string, data?: Dao, config?: ApiRequestConfig): Promise<any> {
    return this.handleAction(() => this.put(url, data, config))
  }

  setToken (token: string): void {
    // NOTE: api is the singleton so we are using it like storage.
    // This is the hack, but we have no idea how to make other way. We don`t want to send token manually each time.
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  async handleAction (cb: Function, noWrapper: boolean = false) {
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

      if (this.isNetworkErrorException(exception)) {
        throw new NetworkError({
          message: exception.message
        })
      }
      throw exception
    }
    return response
  }

  isNetworkErrorException (error: ApiProxyError) {
    return error.message === 'Network Error'
  }

  isApiException (error: ApiProxyError) {
    return !!error.response
  }
}
