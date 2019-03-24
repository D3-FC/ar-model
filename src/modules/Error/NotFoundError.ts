import { AppError } from './AppError'

export class NotFoundError extends AppError {
  static DEFAULT_MESSAGE = 'Not found'
  message = NotFoundError.DEFAULT_MESSAGE
  previous: any
  data: any

  constructor (data = {}) {
    super()
    Object.assign(this, data)
  }
}
