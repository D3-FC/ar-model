import { Dto } from '../DAO/Dto'
import { toCamelCase, toSnakeCase } from './StringHelpers'
import { clone } from './CloneHelpers'

export class IgnoreTransform implements Dto {
  [key: string]: any

  constructor (data: Dto) {
    Object.assign(this, data)
  }
}

export function objectPropsToCamelCase (data: Dto, ignore: string[] = []) {
  if (data instanceof IgnoreTransform) return data

  const props = Object.keys(data)
  const result: Dto = {}
  props.forEach((prop: string) => {
    const camelCaseProp = toCamelCase(prop)
    const propValue = data[prop]

    if (!propValue || ignore.includes(prop)) {
      result[camelCaseProp] = propValue
      return
    }

    if (Array.isArray(propValue)) {
      result[camelCaseProp] = propValue.map(
        (value) => {
          if (!value || !(typeof value === 'object')) return value
          return objectPropsToCamelCase(value)
        })
      return
    }

    if (typeof propValue === 'object') {
      result[camelCaseProp] = objectPropsToCamelCase(propValue)
      return
    }

    result[camelCaseProp] = propValue
  })

  return result
}

export function objectPropsToSnakeCase (data: Dto) {
  if (data instanceof IgnoreTransform) {
    return data
  }
  const props = Object.keys(data)
  const result: Dto = {}
  props.forEach((prop: string) => {
    const kebabCaseProp = toSnakeCase(prop)
    const propValue = data[prop]

    if (!propValue) {
      result[kebabCaseProp] = propValue
      return
    }

    if (Array.isArray(propValue)) {
      result[kebabCaseProp] = propValue.map(
        (value) => {
          if (!value || !(typeof value === 'object')) return value
          return objectPropsToSnakeCase(value)
        })
      return
    }

    if (typeof propValue === 'object') {
      result[kebabCaseProp] = objectPropsToSnakeCase(propValue)
      return
    }

    result[kebabCaseProp] = propValue
  })
  return result
}

export function objectClone (original: object) {
  return clone(original)
}
