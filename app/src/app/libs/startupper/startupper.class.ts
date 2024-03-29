import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { CLIENT_SEZ_DEFINITIONS, previousVersions } from 'app/data/system-local-db/client-sections.enum'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { DbConnector } from 'app/libs/db-connector/db-connector.class'
import { INDEXEDDB_PLUGIN } from 'app/libs/db-connector/plugins/indexed-db/exporter.constant'
import { Logger } from 'app/libs/logger/logger.class'
import { Manager } from 'app/libs/manager/manager.class'
import { ShortcutsListener } from 'app/libs/shortcuts/shortcuts-listener'
import { appVersion } from 'app/version'
import React from 'react'

export class Startupper {
  /**
   * The name of the IndexedDB for system data
   */
  private systemDbName = 'anitaDB'

  public async init (): Promise<void> {
    Logger.info('Anita web app v.', appVersion)
    await this.initSystemIndexedDb(this.systemDbName)
    this.setLoggerDebug()
    this.initCloudConnectors()
    ShortcutsListener.init()
    Manager.loadProjectsList()
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
   * Initializes cloud connectors
   */
  private initCloudConnectors (): void {
    DropboxHelper.init()
  }
}
