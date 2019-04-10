import { Dto } from '../DAO/Dto'

export function objectMeetsCriteria (object: Dto, criteria: Dto): boolean {
  for (const index in criteria) {
    if (criteria[index] !== object[index]) {
      return false
    }
  }
  return true
}
