import { AppError } from './AppError'
import { Dao } from '../DAO/Dao'

export class UnauthorizedError extends AppError {
  static DEFAULT_MESSAGE: string = 'Unauthenticated'
  error: any
  message: string = UnauthorizedError.DEFAULT_MESSAGE
  description: string = ''
  previous: any
  data: any

  constructor (data: Dao = {}) {
    super(data)
    Object.assign(this, data)
  }
}
