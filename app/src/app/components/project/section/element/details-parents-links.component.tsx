import { useEffect, useState } from 'react'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { Link } from 'react-router-dom'
import { Icons } from 'app/libs/icons/icons.class'
import { Bucket } from 'app/state/bucket.state'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { useAtomValue } from 'jotai'
import type { FC } from 'react'
import type { ISection } from 'app/models/section/section.declarations'
import type { ParentInfoForDetailsView } from 'app/models/parent-element/parent-element.declarations'

const AVATAR_VARIANTS = ['', 'ui-avatar-1', 'ui-avatar-2']

interface IProjectSectionElementDetailsParentsLinksProps {
  projectId: string
  parentsInfo: Array<string>
}

export const ProjectSectionElementDetailsParentsLinks: FC<IProjectSectionElementDetailsParentsLinksProps> = (props) => {
  const project = useAtomValue(ProjectAtoms.currentProject)
  const [parents, setParents] = useState<Array<ParentInfoForDetailsView> | undefined>([])
  const sections: Array<ISection> | undefined = project?.getSectionsDefinitions()

  useEffect(() => {
    const getParents = async () => {
      const parents = await Bucket.general.get(ProjectAtoms.currentProject)?.getParentInfoForDetailsView(props.parentsInfo)
      setParents(parents)
    }

    getParents()
  }, [props.parentsInfo, props.projectId, sections])

  // One row per parent section, labelled like the fields above, e.g. "Cuisines: American".
  const groups = (parents ?? []).reduce<Array<{ sectionId: string; parents: Array<ParentInfoForDetailsView> }>>((result, parent) => {
    const group = result.find(item => item.sectionId === parent.sectionId)
    if (group) {
      group.parents.push(parent)
    } else {
      result.push({ sectionId: parent.sectionId, parents: [parent] })
    }
    return result
  }, [])

  return (
    <div className="mt-4 space-y-3">
      {groups.map((group, groupIndex) => {
        const section = sections?.find(section => section.id === group.sectionId)
        return (
          <div key={group.sectionId}>
            <p className="ui-field-label mb-1.5">{section?.title ?? 'Linked to'}</p>
            <div className="flex flex-wrap gap-2">
              {group.parents.map(parent => (
                <Link
                  key={parent.element.id}
                  to={urlParamFiller(ANITA_URLS.projectSectionEleDetails, [
                    { name: URL_PARAMS.projectId, value: props.projectId! },
                    { name: URL_PARAMS.sectionId, value: parent.sectionId! },
                    { name: URL_PARAMS.elementId, value: parent.element.id! },
                  ])}
                  className="ui-link-chip"
                >
                  {/* Each linked section has its own avatar color. */}
                  <span className={`ui-avatar ${AVATAR_VARIANTS[groupIndex % AVATAR_VARIANTS.length]}`}>{Icons.render(section?.icon ?? 'linkOutline')}</span>
                  {parent.txt || 'Untitled'}
                  <span className="ui-link-chip-arrow">{Icons.render('arrowForwardOutline')}</span>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
