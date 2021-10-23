import { WhereArgs } from '@anita/client/libs/db-connector/plugins/mysql/helpers/query-maker.class';

/**
 * Builds where clauses for MySql query string
 */
export class WhereBuilder<E> {

  /**
   * The where arguments as an Array of WhereArgs { field: string, operator: string, value: string | number }
   */
  protected whereArgs: Array<WhereArgs> = [];

  /**
   * Creates an instance of where builder.
   * @param args the arguments to use to build the where clauses
   */
  constructor(
    protected args: Partial<E>
  ) {
    this.addWhereFromObj();
  }

  /**
   * Builds where clauses from an Object. The equals operator `=` is used
   */
  protected addWhereFromObj(): void {
    if (!this.args)
      return;

    for (const key in this.args)
      this.addWhere(key, this.args[key]);
  }

  /**
   * Builds the where arguments for the given field, value and oeprator
   */
  private addWhere(field: string, value: any, operator: string = '='): any {
    const params: WhereArgs = {
      field: field,
      operator: operator,
      value: value
    };
    this.whereArgs.push(params);
    return this;
  }

}
