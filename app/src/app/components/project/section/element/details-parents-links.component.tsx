import { useEffect, useState } from 'react'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { Manager } from 'app/cross-refs-exports'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import type { FC } from 'react'
import type { ISection } from 'app/models/section/section.declarations'
import type { ParentInfoForDetailsView } from 'app/models/parent-element/parent-element.declarations'

interface IProjectSectionElementDetailsParentsLinksProps {
  projectId: string
  parentsInfo: Array<string>
  sections: Array<ISection>
}

export const ProjectSectionElementDetailsParentsLinks: FC<IProjectSectionElementDetailsParentsLinksProps> = (props) => {
  const [parents, setParents] = useState<Array<ParentInfoForDetailsView> | undefined>([])

  useEffect(() => {
    const getParents = async () => {
      const parents = await Manager.getCurrentProject()?.getParentInfoForDetailsView(props.parentsInfo)
      setParents(parents)
    }

    getParents()
  }, [props.parentsInfo, props.projectId, props.sections])

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
