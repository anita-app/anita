import { useEffect, useState } from 'react'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { Bucket } from 'app/state/bucket.state'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { useAtomValue } from 'jotai'
import type { FC } from 'react'
import type { ISection } from 'app/models/section/section.declarations'
import type { ParentInfoForDetailsView } from 'app/models/parent-element/parent-element.declarations'

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

  return (
    <div className="p-3 pt-0">
      <p className="text-sm text-gray-500 mb-2">Parent elements:</p>
      {parents?.map(parent => (
        <Button
          id={parent.element.id!}
          label={parent.txt}
          type={Type.secondary}
          size="sm"
          href={urlParamFiller(ANITA_URLS.projectSectionEleDetails, [
            { name: URL_PARAMS.projectId, value: props.projectId! },
            { name: URL_PARAMS.sectionId, value: parent.sectionId! },
            { name: URL_PARAMS.elementId, value: parent.element.id! },
          ])}
          key={parent.element.id}
          className="font-semibold"
        />
      ))}
    </div>
  )
}
