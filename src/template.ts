export function processTemplate(template: string, link: string): string {
  let lastPosition = 0
  let isFound

  do {
    const start = template.indexOf('<!---', lastPosition)
    const end = template.indexOf('--->', start)
    lastPosition = end + 4

    isFound = start >= 0 && end > start

    if (isFound) {
      const replacement = template.substring(start + 5, end)
      const matches = [
        replacement.split('=', 1).toString(),
        replacement
          .split('=')
          .slice(1)
          .join('=')
      ]
      if (matches.length < 2) {
        continue
      }
      const [regexpValue, text] = matches

      const regexp = new RegExp(regexpValue)

      if (regexp.test(link)) {
        return template.substring(0, start) + text.replace(/%/g, link) + template.substring(end + 4)
      }
    }
  } while (isFound)

  return template
}
