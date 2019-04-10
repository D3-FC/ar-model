import { objectMeetsCriteria } from './ObjectHelpers'
import { Dto } from '../DAO/Dto'

type Criteria = Dto | Function

/**
 * Remove item from array via criteria check.
 */
export function arrayRemoveByCriteria<T> (array: T[], criteria: Dto | Function) {
  const existingItem = arrayFindByCriteria(array, criteria)
  if (existingItem) {
    arrayRemove(array, existingItem)
  }
}

/**
 * Remove item from array via identity check.
 */
export function arrayRemove<T> (array: T[], item: T) {
  const foundItemIndex = array.indexOf(item)
  if (foundItemIndex !== -1) {
    array.splice(foundItemIndex, 1)
  }
}

/**
 * Find item by criteria.
 */
export function arrayFindByCriteria<T> (array: T[], criteria: Criteria): T | null {
  return array.find(
    item => {
      return typeof criteria === 'function'
        ? criteria(item)
        : objectMeetsCriteria(item, criteria)
    }
  ) || null
}
