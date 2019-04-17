export function toKebabCase (text: string): string {
  return text.replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/(\s+|_)/g, '-')
    .toLowerCase()
}

export function toSnakeCase (text: string): string {
  return text.replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/(\s+|-)/g, '_')
    .toLowerCase()
}

export function toCamelCase (text: string): string {
  return text
    .replace(/(\s|_)(.)/g, function ($1) { return $1.toUpperCase() })
    .replace(/\s|_/g, '')
    .replace(/^(.)/, function ($1) { return $1.toLowerCase() })
}

export function getUIID (): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
