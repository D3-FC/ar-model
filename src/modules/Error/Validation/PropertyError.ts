export class PropertyError {
  key: string = ''
  value: string|string[] = ''

  constructor (data = {}) {
    Object.assign(this, data)
  }
}
