import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum'
import { Bucket } from 'app/state/bucket.state'
import { ProjectsListAtoms } from 'app/state/projects-list/projects-list.atoms'
import { liveQuery } from 'dexie'
import type { LocalProjectSettings } from 'app/models/project/project.declarations'

export class ProjectsListState {
  public static watchProjectsList = (): Promise<true> => (
    new Promise((resolve) => {
      liveQuery(() => dbInstances.system.dbStore.db.table<LocalProjectSettings>(CLIENT_SECTIONS.projects).toArray())
        .subscribe((projects) => {
          Bucket.general.set(ProjectsListAtoms.projects, projects)
          resolve(true)
        })
    })
  )
}
