export class TextTools {
  /* eslint-disable n/no-callback-literal */
  // Removes non ascii characters from a string and replaces with ascii chars, plus replaces spaces with -
  public static cleanString (source: string): string {
    let r = source.toLowerCase()
    const nonAsciis = {
      a: '[àáâãäå]',
      ae: 'æ',
      c: 'ç',
      e: '[èéêë]',
      i: '[ìíîï]',
      n: 'ñ',
      o: '[òóôõö]',
      oe: 'œ',
      u: '[ùúûűü]',
      y: '[ýÿ]'
    }
    for (const i in nonAsciis) {
      r = r.replace(new RegExp(nonAsciis[i as keyof typeof nonAsciis], 'g'), i)
    }

    return r.replace(/\s/g, '-')
      .replace(/[^\w-]/gi, '')
  }

  /**
 * Converts a string from camelCase to kebab-case
 */
  public static camelToKebabCase = (str: string) => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

  /**
 * Capitalizes the first letter of a string
 */
  public static capitalizeFirstLetter = (str: string) => str?.charAt(0).toUpperCase() + str.slice(1)
}
