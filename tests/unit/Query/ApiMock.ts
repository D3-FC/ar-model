import { ApiContract } from '../../../src/modules/Api/ApiContract'
import { Dao } from '../../../src/modules/DAO/Dao'
import { ConfigContract } from '../../../src/modules/Api/ConfigContract'

export class ApiMock implements ApiContract {
  url?: string
  payload?: Dao
  config?: ConfigContract

  withWrapper: boolean = false

  constructor (withWrapper: boolean = false) {
    this.withWrapper = withWrapper
  }

  async delete (url: string, data?: Dao, config?: ConfigContract): Promise<any> {
    this.url = url
    this.payload = data
    this.config = config
    return 'response'
  }

  async get (url: string, data?: Dao, config?: ConfigContract): Promise<any> {
    this.url = url
    this.payload = data
    this.config = config
    return 'response'
  }

  async post (url: string, data?: Dao, config?: ConfigContract): Promise<any> {
    this.url = url
    this.payload = data
    this.config = config
    return 'response'
  }

  async put (url: string, data?: Dao, config?: ConfigContract): Promise<any> {
    this.url = url
    this.payload = data
    this.config = config
    return 'response'
  }

  setToken (token: string): void {
  }
}
