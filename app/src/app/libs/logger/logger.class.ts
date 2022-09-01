export class Logger {
  /**
   * Whether to print to the console debug info
   */
  public static debug = true

  /**
   * Spaces to format list elements
   */
  private static spacesForListeles = '\n                            - '

  // INFO

  /**
   * Formats in one line a description and a value
   */
  public static info<T> (desc: string, value?: T): string {
    const arrMsg = (value) ? [`${desc}: ${JSON.stringify(value)}`] : [desc]
    return Logger.doLog(arrMsg)
  }

  // LIST

  /**
   * Generates a list in the console for an array of strings
   */
  public static list (desc: string, list: Array<string> | Object): string {
    if (Logger.isEmptyList(list)) {
      Logger.doLog([desc, 'none'])
    }

    let stringList = (Array.isArray(list)) ? Logger.listFromArray(list) : Logger.listFromObject(list)

    stringList = stringList.substring(0, stringList.length - 1)
    stringList += '.'

    return Logger.doLog([`${desc} ${stringList}`])
  }

  /**
   * Determines whether a list is empty
   */
  private static isEmptyList (list: Array<string> | Object): boolean {
    return (Array.isArray(list) && !list.length) || (typeof list === 'object' && !Object.keys(list).length)
  }

  /**
   * Creates a list from an array
   */
  private static listFromArray (list: Array<string>): string {
    let stringList = ''
    list.forEach(line => {
      stringList += `${Logger.spacesForListeles}${Logger.formatValueForList(line)};`
    })
    return stringList
  }

  /**
   * Creates a list from a object
   */
  private static listFromObject (list: Object): string {
    let stringList = ''
    for (const key in list) {
      stringList += `${Logger.spacesForListeles}${key}: ${Logger.formatValueForList(list[key])};`
    }
    return stringList
  }

  // RAW

  /**
   * Same as console.log
   */
  public static raw (desc: string, txt?: any): string {
    return Logger.doLog([`${desc}: `, txt])
  }

  // ERROR

  /**
   * Same as console.error
   */
  public static error (desc: string, txt?: string, extra?: any): string {
    return Logger.doLog([desc, txt, extra], 'error')
  }

  /**
   * Same as console.warn
   */
  public static warn (desc: string, txt?: string, extra?: any): string {
    return Logger.doLog([desc, txt, extra], 'warn')
  }

  // COMMON

  /**
   * Converts non primitive values to string
   */
  private static formatValueForList<T> (value: T): T | string {
    return (Logger.isPrimitiveValue(value) || value === null) ? value : JSON.stringify(value)
  }

  /**
   * Determines whether a value is a primitive
   */
  private static isPrimitiveValue<T> (value: T): boolean {
    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean':
      case 'undefined':
        return true
      default:
        return false
    }
  }

  /**
   * Logs text to the console if debug is `true`
   */
  private static doLog (data: Array<string | number>, methodName: 'log' | 'error' | 'warn' = 'log'): string {
    const date = new Date().toISOString()
    data[0] = `[${date}] ${data[0]}`

    if (Logger.debug === true) {
      console[methodName](...data)
    }

    return data.join('. ')
  }
}
