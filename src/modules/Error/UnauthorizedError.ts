import { AppError } from './AppError'
import { Dto } from '../DAO/Dto'

export class UnauthorizedError extends AppError {
  static DEFAULT_MESSAGE: string = 'Unauthenticated'
  error: any
  message: string = UnauthorizedError.DEFAULT_MESSAGE
  description: string = ''
  previous: any
  data: any

  constructor (data: Dto = {}) {
    super(data)
    Object.assign(this, data)
  }
}
