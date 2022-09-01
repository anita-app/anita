import { AbstractModel } from 'app/libs/DbConnector/models/abstract-model'
import { NewWhere } from 'app/libs/DbConnector/plugins/indexed-db/query-makers/query-maker.class'

export interface BetweenSearchParams {
  field: string;
  lowerBound: string | number;
  upperBound: string | number;
  includeLower: boolean;
  includeUpper: boolean;
}

export type SuppoertedOperators = '===' | '!=' | '>' | '>=' | '<' | '<=' | '=';

export interface FieldNValues {
  [index: string]: string | number;
}

export type Filter4Dexie = (item: Object) => boolean;

/**
 * Support methods to build queries with `QueryMaker` on IndexedDB with Dexie
 *
 * @see QueryMaker
 */
export class QueryHelper {
  /**
   * Determines the methods to execute for the select query based on the number of arguments.
   */
  public static methodToExecute (DS: AbstractModel, arraysWhere: Array<NewWhere>, section: keyof AbstractModel): 'dexieFullCollection' | 'dexieBetween' | 'dexieGet' | 'dexieWhere' | 'complexSelect' {
    const arraysWhereLen = arraysWhere.length

    if (!arraysWhereLen) {
      return 'dexieFullCollection'
    }

    // tslint:disable-next-line:max-line-length
    if (arraysWhereLen === 2 && (arraysWhere[0][1] === '>=' || arraysWhere[0][1] === '>') && (arraysWhere[1][1] === '<=' || arraysWhere[1][1] === '<')) {
      return 'dexieBetween'
    }

    if (arraysWhere[0][1] !== '=') {
      return 'complexSelect'
    }

    if (arraysWhereLen === 1 && arraysWhere[0][0] === DS[section].pk) {
      return 'dexieGet'
    }

    if (DS[section].indexes.indexOf(arraysWhere[0][0]) > -1) {
      return 'dexieGet'
    }

    let dexieWhere = true

    arraysWhere.forEach(whereArr => {
      if (whereArr[1] !== '=') {
        dexieWhere = false
      }
      if (DS[section].indexes.indexOf(whereArr[0]) < 0) {
        dexieWhere = false
      }
    })

    if (dexieWhere) {
      return 'dexieWhere'
    }

    return 'complexSelect'
  }

  /**
   * Converts an Array of where arguments (field, operator, value) to an object with field and value
   */
  public static buildArrayFildsNValues (arraysWhere: Array<NewWhere>): FieldNValues {
    const objFieldsNValues: FieldNValues = {}

    arraysWhere.forEach(arrSearch => {
      objFieldsNValues[arrSearch[0]] = arrSearch[2]
    })

    return objFieldsNValues
  }

  /**
   * Builds between search params, optionally including upper or lower boundary
   */
  public static buildBetweenSearchParams (arraysWhere: Array<NewWhere>): BetweenSearchParams {
    const includeLower = (arraysWhere[0][1] === '>=')
    const includeUpper = (arraysWhere[1][1] === '<=')
    return {
      field: arraysWhere[0][0],
      lowerBound: arraysWhere[0][2],
      upperBound: arraysWhere[1][2],
      includeLower,
      includeUpper
    }
  }

  /**
   * Builds the filter to select elements for complex queries not supported by Dexie due to IndexedDB limits
   */
  public static buildFilter4Dexie (filter: NewWhere): Filter4Dexie {
    const field = filter[0]
    const operator = filter[1]
    const value = filter[2]
    return (item): boolean => {
      switch (operator) {
        case '===':
          return item[field] === value
        case '!=':
          // eslint-disable-next-line eqeqeq
          return item[field] != value
        case '>':
          return item[field] > value
        case '>=':
          return item[field] >= value
        case '<':
          return item[field] > value
        case '<=':
          return item[field] <= value
        default:
          // eslint-disable-next-line eqeqeq
          return item[field] == value
      }
    }
  }

  /**
   * Chains filters
   */
  public static chainFilters (where: Array<Filter4Dexie>, logic: 'AND' | 'OR'): Filter4Dexie {
    return (item): boolean => {
      if (!where.length) {
        return true
      }

      let result: boolean = where[0](item)

      for (const filter of where) {
        switch (logic) {
          case 'OR':
            result = result || filter(item)
            break
          default:
            result = result && filter(item)
        }
      }

      return result
    }
  }
}
