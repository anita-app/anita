import React from 'react'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing-n/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing-n/url-param-fillers.function'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'

interface INoSectionDataProps {
  sectionTitle: string
  sectionId: string
  projectId: string
}

export const NoSectionData: React.FC<INoSectionDataProps> = ({ sectionTitle, sectionId, projectId }) => (
  <div className="container px-5 py-24 mx-auto">
    <div className="p-4 lg:w-2/3 mx-auto">
      <div className="h-full bg-white shadow px-8 pt-16 pb-16 rounded-lg overflow-hidden text-center relative">
        <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">Nothing here yet</h2>
        <h1 className="title-font sm:text-2xl text-xl font-medium text-gray-900 mb-3">There are no items in {sectionTitle}</h1>
        <p className="leading-relaxed mb-3">Create a new entry to populate this list</p>
        <div className="flex flex-wrap mt-7">
          <Button
            id="createProject"
            label="Create a new entry"
            href={urlParamFiller(ANITA_URLS.projectSectionAddEle, [{ name: URL_PARAMS.projectId, value: projectId }, { name: URL_PARAMS.sectionId, value: sectionId }])}
            type={Type.primary}
            size="lg"
            marginClassName="mx-2 mt-4"
            className="flex-grow"
          />
        </div>
      </div>
    </div>
  </div>
)
