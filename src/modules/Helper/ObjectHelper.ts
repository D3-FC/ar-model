import { Dto } from '../DAO/Dto'
import { toCamelCase } from './StringHelpers'

export function objectPropsToCamelCase (data: Dto) {
  const props = Object.keys(data)
  const result: Dto = {}
  props.forEach((prop: string) => {
    const camelCaseProp = toCamelCase(prop)
    const propValue = data[prop]

    if (Array.isArray(propValue)) {
      result[camelCaseProp] = propValue.map(objectPropsToCamelCase)
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
