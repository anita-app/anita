import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { ProjectLoadedFooter } from 'app/components/projects/project-card-components/project-loaded-footer.component'
import { ProjectNotLoadedFooter } from 'app/components/projects/project-card-components/project-not-loaded-footer.component'
import { DeleteProjectButton } from 'app/components/shared-components/buttons/delete-project.component'
import * as dateFormat from 'date-format'
import { CardFooter } from 'app/components/shared-components/common-ui-eles/card-footer.component'
import { useAtomValue } from 'jotai'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import { Icons } from 'app/libs/icons/icons.class'
import { OnboardingState } from 'app/state/onboarding/onboarding-state.class'
import { ProjectAvatar } from 'app/components/shared-components/common-ui-eles/project-avatar.component'
import type { CSSProperties, FC } from 'react'
import type { IProjectSettings } from 'app/models/project/project.declarations'

interface IProjectCardProps {
  project: IProjectSettings
  /** Position in the list, for the staggered entrance */
  index?: number
}

export const ProjectCard: FC<IProjectCardProps> = (props) => {
  const projectState = useAtomValue(ProjectAtoms.currentSystemData)
  const remotes = useAtomValue(SyncStateAtoms.wordPressRemotes)

  return (
    <div
      className="ui-card ui-pcard ui-rise h-full"
      style={{ '--d': props.index ?? 0 } as CSSProperties}
    >
      <div className="p-5 md:p-6">
        <div className="flex items-start gap-4">
          <ProjectAvatar
            id={props.project.id}
            title={props.project.title}
            size="large"
          />
          <div className="min-w-0 grow">
            <h2 className="ui-title text-lg break-words">{props.project.title}</h2>
            {props.project.description && <p className="text-sm text-[#5b6b80] mt-0.5">{props.project.description}</p>}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-[#7a8799]">
              <span className="inline-flex items-center gap-1">
                {Icons.render('calendarOutline')} Created on {dateFormat('yyyy/MM/dd, at hh:mm', new Date(props.project.createdAt))}
              </span>
              {props.project.remoteStorage
                ? (
                  <span className="inline-flex items-center gap-1">
                    {Icons.render('logoWordpress')}
                    Synced with {remotes.find(remote => remote.remoteId === props.project.remoteStorage)?.data.site_name ?? props.project.remoteStorage}
                  </span>)
                : (
                  <button
                    type="button"
                    onClick={() => OnboardingState.openStoreOnWordPress(props.project.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 font-semibold text-orange-800 transition hover:bg-orange-100 hover:shadow-[0_0_0_3px_rgba(249,115,22,0.12)]"
                  >
                    <span className="ui-dot" />
                    Only on this device, no backup ·{' '}
                    <span className="underline underline-offset-2">Save it on WordPress</span>
                  </button>)}
            </div>
          </div>
        </div>
        <CardFooter className="mt-5! pt-4 border-t border-[#eef1f5] items-center!">
          <DeleteProjectButton project={props.project} />
          <div className="ml-auto">
            {(
              projectState === null ||
            projectState[RESERVED_AUDS_KEYS._settings][0].id !== props.project.id ||
            dbInstances[props.project.id] === undefined
            )
              ? <ProjectNotLoadedFooter project={props.project} />
              : <ProjectLoadedFooter project={props.project} />}
          </div>
        </CardFooter>

      </div>
    </div>
  )
}
