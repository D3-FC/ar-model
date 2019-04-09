import { Dto } from '../DAO/Dto'
import { ConfigContract } from './ConfigContract'

export interface ApiContract {

  get (url: string, data?: Dto, config?: ConfigContract): Promise<any>
  post (url: string, data?: Dto, config?: ConfigContract): Promise<any>
  put (url: string, data?: Dto, config?: ConfigContract): Promise<any>
  delete (url: string, data?: Dto, config?: ConfigContract): Promise<any>

  setToken(token: string): void
}
