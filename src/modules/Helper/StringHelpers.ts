export function toKebabCase (text: string): string {
  return text.replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/(\s+|_)/g, '-')
    .toLowerCase()
}

export function toCamelCase (text: string): string {
  return text
    .replace(/(\s|_)(.)/g, function ($1) { return $1.toUpperCase() })
    .replace(/\s|_/g, '')
    .replace(/^(.)/, function ($1) { return $1.toLowerCase() })
}
