import { AbstractModel } from 'app/libs/DbConnector/models/abstract-model'
import { DbStoreInterface, DsDbInitOptions } from 'app/libs/DbConnector/models/executers'
import { Deta as DetaFunction } from 'deta'
import Base from 'deta/dist/types/base'
import Deta from 'deta/dist/types/deta'

/**
 * Implementation of DbStore for Deta Base.
 */
export class DbStore implements DbStoreInterface<Base> {
  public db: Base
  private deta: Deta

  constructor (
    private options: DsDbInitOptions,
    private DS: AbstractModel
  ) { }

  public async initDB (): Promise<DbStoreInterface<Base>> {
    if (!this.options.detaConnectionData) {
      throw Error('No connection data provided. Please provide a name for the database by setting the name on the property detaConnectionData in the options passed to DbConnector.')
    }

    this.setDeta()
    this.setDb()
    return this
  }

  public close (): void {
    // not implemented
  }

  private setDeta (): void {
    this.deta = DetaFunction(this.options.detaConnectionData.projectKey)
  }

  private setDb (): void {
    this.db = this.deta.Base(this.options.detaConnectionData.projectId)
  }
}
