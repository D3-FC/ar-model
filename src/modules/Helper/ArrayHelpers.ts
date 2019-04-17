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

/**
 * Find item by criteria.
 */
export function arrayFindIndexByCriteria (array: any[], criteria: Criteria): number {
  return array.findIndex(
    item => {
      return typeof criteria === 'function'
        ? criteria(item)
        : objectMeetsCriteria(item, criteria)
    }
  )
}

export function arraySpliceOrNewByCriteria<T> (array: T[], criteria: Dto | Function, item: T, addIndex = 0) {
  const index = arrayFindIndexByCriteria(array, criteria)

  if (index >= 0) {
    array.splice(index, 1, item)
    return
  }
  array.splice(addIndex, 0, item)
}
