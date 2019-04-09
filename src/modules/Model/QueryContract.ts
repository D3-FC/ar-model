import ArModel from './ArModel'
import { Dto } from '../DAO/Dto'

export interface QueryContract {
  to (resource: string | ArModel): this
  post (payload?: object, url?: string): Promise<any>
  put (payload?: object, url?: string): Promise<any>
  delete (payload?: object, url?: string): Promise<any>
  get (payload?: Dto, url?: string): Promise<any>
  setPayload (payload: object): this
  expandUrl (url?: string | number | null): this
  paginate (page?: number, perPage?: number): Promise<any>
}
