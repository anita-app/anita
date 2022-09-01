import { SqlValue } from 'sql.js'

export function serializer<E> (columns: Array<string>, values: Array<Array<SqlValue>>): Array<E> {
  return values.map(row => {
    const objData = {} as E
    row.forEach((cell, index) => {
      objData[columns[index]] = cell
    })
    return objData
  })
}
