import { Dao } from '../DAO/Dao'
import { ConfigContract } from './ConfigContract'

export interface ApiContract {

  get (url: string, data?: Dao, config?: ConfigContract): Promise<any>
  post (url: string, data?: Dao, config?: ConfigContract): Promise<any>
  put (url: string, data?: Dao, config?: ConfigContract): Promise<any>
  delete (url: string, data?: Dao, config?: ConfigContract): Promise<any>

  setToken(token: string): void
}
