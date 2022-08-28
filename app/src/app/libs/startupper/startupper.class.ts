import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { CLIENT_SEZ_DEFINITIONS, previousVersions } from 'app/data/system-local-db/client-sections.enum'
import { DbConnector } from 'app/libs/db-connector/db-connector.class'
import { INDEXEDDB_PLUGIN } from 'app/libs/db-connector/plugins/indexed-db/exporter.constant'
import { Logger } from 'app/libs/Logger/logger.class'
import { ProjectsListLoader } from 'app/libs/projects-helpers/projects-handlers/projects-list-loader.class'
import React from 'react'

export class Startupper {
  /**
   * The name of the IndexedDB for system data
   */
  private systemDbName = 'anitaDB'

  public async init (): Promise<void> {
    Logger.info('Anita web app.')
    await this.initSystemIndexedDb(this.systemDbName)
    this.setLoggerDebug()
    this.loadProjectList()
  }

  /**
   * Inits IndexedDB for system data
   */
  private async initSystemIndexedDb (indexedDbName: string): Promise<void> {
    dbInstances.system = await new DbConnector(INDEXEDDB_PLUGIN, { previousVersions, indexedDbName }, CLIENT_SEZ_DEFINITIONS, false).init()
  }

  /**
   * Detect if React is in development mode
   */
  private isReactDev (): boolean {
    return '_self' in React.createElement('div')
  }

  /**
   * Sets logger debug
   */
  private setLoggerDebug (): void {
    Logger.debug = this.isReactDev()
  }

  /**
   * We need to load the project list for the project selector
   */
  private loadProjectList (): void {
    new ProjectsListLoader().load()
  }
}
