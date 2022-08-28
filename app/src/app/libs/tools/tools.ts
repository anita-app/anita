/* eslint-disable n/no-callback-literal */
// Removes non ascii characters from a string and replaces with ascii chars, plus replaces spaces with -
export function cleanString (source: string): string {
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
    r = r.replace(new RegExp(nonAsciis[i], 'g'), i)
  }

  return r.replace(/\s/g, '-')
    .replace(/[^\w-]/gi, '')
}

/**
 * Asyncs forEach. Unlike native JS forEach, this one awaits each callback to resolve befofore iterating to the next element of the array
 * @param array the array to loop
 * @param callback the function to call on each element of the array
 */
export async function asyncForEach<T> (array: Array<T>, callback: (item: T, index: number, arr: Array<T>) => Promise<any>): Promise<void> {
  const totalLength = array.length
  for (let index = 0; index < totalLength; index++) {
    await callback(array[index] as T, index, array)
  }
}

/**
 * Gets the current utcdate and time as an ISO string
 */
export function getUTCDateTime (): string {
  return new Date(new Date().toUTCString()).toISOString()
}

/**
 * Gets the current date and time as an ISO string
 */
export function getDateTime (): string {
  return new Date(new Date()).toISOString()
}
