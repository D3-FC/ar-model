import { PropertyError } from './PropertyError'
import { toCamelCase } from '../../Helper/StringHelpers'
import { Dto } from '../../DAO/Dto'

export default class PropertyCollectionError {
  errors: PropertyError[] = []

  constructor (data = {}) {
    Object.assign(this, data)
  }

  getFor (field: string): string|string[]|null {
    const validationError = this.errors.find(
      error => error.key === field || error.key === `${field}_id`)
    return validationError ? validationError.value : null
  }

  clearFor (field = '') {
    const validationError = this.errors.find(
      error => error.key === field || error.key === `${field}_id`)
    if (validationError) {
      validationError.value = []
    }
  }

  clear () {
    this.errors = []
  }

  static createFromLaravelError (laravelErrors: Dto) {
    let errors = Object.keys(laravelErrors.errors).map(key => {
      const value = laravelErrors.errors[key]
      return new PropertyError({ key: toCamelCase(key), value })
    })
    return new PropertyCollectionError({ errors })
  }

  addError (key: string, value: string) {
    this.errors.push(new PropertyError({ key, value }))
  }

  clearCollection () {
    this.errors = []
  }

  get hasError () {
    return !!this.errors.length
  }
}
