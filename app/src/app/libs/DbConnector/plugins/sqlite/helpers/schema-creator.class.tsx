import { AbstractModel } from 'app/libs/DbConnector/models/abstract-model'
import { DbStore } from 'app/libs/DbConnector/plugins/sqlite/db-store/dbstore.class'

export class SchemaCreator {
  private sql = ''

  constructor (
    private dbStore: DbStore,
    private DS: AbstractModel
  ) { }

  public async createSchema () {
    for (const table in this.DS) {
      this.handleTable(this.DS[table].name, this.DS[table].fields)
    }
    await this.dbStore.db.run(this.sql)
  }

  public handleTable (table: string, fields: Array<string>): void {
    this.sql += `DROP TABLE IF EXISTS '${table}'; CREATE TABLE '${table}' (${this.createFields(fields)});`
  }

  private createFields (fields: Array<string>): string {
    let sql = ''
    for (const field of fields) {
      sql += `${field} TEXT,`
    }
    return sql.substring(0, sql.length - 1)
  }
}
