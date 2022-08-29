/* eslint-disable n/no-callback-literal */

export class ArrayTools {
  /**
 * Asyncs forEach. Unlike native JS forEach, this one awaits each callback to resolve befofore iterating to the next element of the array
 * @param array the array to loop
 * @param callback the function to call on each element of the array
 */
  public static async asyncForEach<T> (array: Array<T>, callback: (item: T, index: number, arr: Array<T>) => Promise<any>): Promise<void> {
    const totalLength = array.length
    for (let index = 0; index < totalLength; index++) {
      await callback(array[index] as T, index, array)
    }
  }
}
