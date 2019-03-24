// @ts-ignore
import PropertyCollectionError from './PropertyCollectionError'
// @ts-ignore
import { AppError } from '../AppError'

// TODO: decouple with axios response. Make proxy exception.
export class ValidationError extends AppError {
  message!: string

  code?: string

  errors: PropertyCollectionError = new PropertyCollectionError({})

  previous?: Error

  constructor (data = {}) {
    super()
    Object.assign(this, data)
  }

  static createFromLaravelError (exception: any): ValidationError {
    const response = exception && exception.response
    const data = response && response.data
    if (ValidationError.isValidationError(exception)) {
      return new ValidationError({
        message: data.message,
        code: data.code,
        errors: PropertyCollectionError.createFromLaravelError(data),
        previous: exception
      })
    }
    throw exception
  }

  static isValidationError (exception: any) {
    const status = exception && exception.response && exception.response.status
    return status === 422
  }

  toString () {
    return this.message
  }

  clear () {
    this.message = ''
    this.code = undefined
    this.errors.clearCollection()
  }

  addError (key: string, value: string) {
    this.errors.addError(key, value)
  }

  get hasErrors (): boolean {
    return !!this.errors.hasError
  }

  getError (field: string): string | string[] | null {
    return this.errors.getFor(field)
  }
}
