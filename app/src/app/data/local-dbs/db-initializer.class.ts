import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { DataStructureExtender } from 'app/data/system-local-db/data-structure-extender.class'
import { DbConnector } from 'app/libs/db-connector/db-connector.class'
import { INDEXEDDB_PLUGIN } from 'app/libs/db-connector/plugins/indexed-db/exporter.constant'
import type { ISection } from 'app/models/section/section.declarations'
import type { LocalProjectSettings } from 'app/models/project/project.declarations'

export class DbInitializer {
  private projectId: string

  constructor (
    private projectInfo: LocalProjectSettings,
    private projectSections?: Array<ISection>,

  ) {
    this.projectId = projectInfo.id
  }

  public async init (): Promise<void> {
    if (this.projectSections) {
      const dsExpander = new DataStructureExtender(this.projectSections)
      dsExpander.extend()
      dbInstances[this.projectId] = await new DbConnector(
        INDEXEDDB_PLUGIN,
        { previousVersions: [], indexedDbName: this.projectId },
        dsExpander.allSez,
      ).init()
    } else if (this.projectInfo.dexieInfoForUpgrade) {
      dbInstances[this.projectId] = await new DbConnector(
        INDEXEDDB_PLUGIN,
        {
          previousVersions: this.projectInfo.dexieInfoForUpgrade.previousVersions,
          DS: this.projectInfo.dexieInfoForUpgrade.DS,
          indexedDbName: this.projectId,
        },
      ).init()
    }
  }
}
