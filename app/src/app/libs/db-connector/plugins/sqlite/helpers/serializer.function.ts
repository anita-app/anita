import { SqlValue } from 'sql.js'

export function serializer<E> (columns: Array<keyof E>, values: Array<Array<SqlValue>>): Array<E> {
  return values.map(row => {
    const objData = {} as E
    row.forEach((cell, index) => {
      const key = columns[index]
      objData[key] = cell as any
    })
    return objData
  })
}
