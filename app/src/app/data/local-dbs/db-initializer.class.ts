import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { LocalProjectSettings } from 'app/models/project/project.declarations'
import { ISection } from 'app/models/section/section.declarations'
import { DataStructureExtender } from 'app/data/system-local-db/data-structure-extender.class'
import { DbConnector } from 'app/libs/db-connector/db-connector.class'
import { FILE_HANDLES_PLUGIN } from 'app/libs/db-connector/plugins/file-handles/exporter.constant'
import { FileSystemFileHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api'
import { INDEXEDDB_PLUGIN } from 'app/libs/db-connector/plugins/indexed-db/exporter.constant'
import { SQLITE_PLUGIN } from 'app/libs/db-connector/plugins/sqlite/exporter.constant'
import { Logger } from 'app/libs/logger/logger.class'

export class DbInitializer {
  private projectId: string

  constructor (
    private projectInfo: LocalProjectSettings,
    private projectSections?: Array<ISection>,
    private fileHandle?: FileSystemFileHandle

  ) {
    this.projectId = projectInfo.id
  }

  public async init (): Promise<void> {
    // Relaxed equality check, because localStorage prop might be a string in some storage systems
    // eslint-disable-next-line eqeqeq
    if (this.projectInfo.localStorage == LOCAL_STORAGE_SYSTEMS.json) {
      await this.doJson()
    // eslint-disable-next-line eqeqeq
    } else if (this.projectInfo.localStorage == LOCAL_STORAGE_SYSTEMS.SQLite) {
      await this.doSQLite()
    } else {
      await this.doIndexedDb()
    }
  }

  private async doJson (): Promise<void> {
    Logger.info('[DbInitializer.doJson] Initializing JSON DB')
    if (this.fileHandle) {
      this.projectInfo = { ...this.projectInfo, fileHandle: this.fileHandle }
    }
    dbInstances[this.projectId] = await new DbConnector(FILE_HANDLES_PLUGIN, { projectInfo: this.projectInfo }).init()
  }

  private async doSQLite (): Promise<void> {
    Logger.info('[DbInitializer.doJson] Initializing SQLite')
    if (this.fileHandle) {
      this.projectInfo = { ...this.projectInfo, fileHandle: this.fileHandle }
    }

    let dsExpander
    if (this.projectSections) {
      dsExpander = new DataStructureExtender(this.projectSections)
      dsExpander.extend()
    }
    dbInstances[this.projectId] = await new DbConnector(
      SQLITE_PLUGIN,
      { projectInfo: this.projectInfo },
      dsExpander?.allSez
    ).init()
  }

  private async doIndexedDb (): Promise<void> {
    Logger.info('[DbInitializer.doJson] Initializing IndexedDB')
    if (this.projectSections) {
      const dsExpander = new DataStructureExtender(this.projectSections)
      dsExpander.extend()
      dbInstances[this.projectId] = await new DbConnector(
        INDEXEDDB_PLUGIN,
        { previousVersions: [], indexedDbName: this.projectId },
        dsExpander.allSez
      ).init()
    } else if (this.projectInfo.dexieInfoForUpgrade) {
      dbInstances[this.projectId] = await new DbConnector(
        INDEXEDDB_PLUGIN,
        {
          previousVersions: this.projectInfo.dexieInfoForUpgrade.previousVersions,
          DS: this.projectInfo.dexieInfoForUpgrade.DS,
          indexedDbName: this.projectId
        }
      ).init()
    }
  }
}
