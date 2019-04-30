// @ts-ignore
import cloneSource from 'clone'

export function clone<T> (data: T): T {
  return cloneSource(data)
}
