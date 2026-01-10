import { availableSystems } from 'app/data/project-form-builder/project-info-builder.constant'
import { SectionElement } from 'app/models/section-element/section-element.class'
import { DeleteProjectButton } from 'app/components/shared-components/buttons/delete-project.component'
import { EditProjectButton } from 'app/components/shared-components/buttons/edit-project-button.component'
import { ExportButton } from 'app/components/shared-components/buttons/export-project-button.component'
import { CardFooter } from 'app/components/shared-components/common-ui-eles/card-footer.component'
import * as dateFormat from 'date-format'
import { WordpressHelper } from 'app/libs/cloud-sync/wordpress/wordpress-helper.class'
import { useEffect, useState, type FC } from 'react'
import type { IProjectSettings } from 'app/models/project/project.declarations'

interface IProjectDetailsCardProps {
  project: IProjectSettings
}

const LinkToRemote: FC<{ remoteUrl: string }> = (props) => (
  <>
    {' '}
    <a
      href={props.remoteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="underline"
    >
      {props.remoteUrl}
    </a>
  </>
)

export const ProjectDetailsCard: FC<IProjectDetailsCardProps> = (props) => {
  const [remoteName, setRemoteName] = useState<null | string>()
  const [remoteUrl, setRemoteUrl] = useState<null | string>()

  useEffect(() => {
    const fetchRemoteName = async () => {
      if (props.project.remoteStorage) {
        const remote = await WordpressHelper.instance.getRemoteInfo(props.project.remoteStorage)
        if (remote?.data.site_name) {
          setRemoteName(remote?.data.site_name)
          setRemoteUrl(remote?.data.site_url)
        }
      }
    }
    fetchRemoteName()
  }, [props.project.remoteStorage])

  return (
    <div className="p-6">
      <h1 className="title-font text-lg font-medium text-gray-900 mb-3">{props.project.title}</h1>

      <p className="text-lg mb-3">{props.project.description}</p>

      <p className="text-gray-600 text-xs">Created on:</p>
      <p className="text-md mb-3">{dateFormat('yyyy/MM/dd, at hh:mm', new Date(props.project.createdAt))}</p>

      {props.project.remoteStorage && (
      <>
        <p className="text-gray-600 text-xs">Remote storage:</p>
        <p className="text-md mb-3">{remoteName ?? props.project.remoteStorage} {remoteUrl && <LinkToRemote remoteUrl={remoteUrl} />}</p>
      </>
      )}

      <p className="text-gray-600 text-xs">Storage method:</p>
      <p className="text-md">{SectionElement.txtByFieldValue(availableSystems, props.project.localStorage!)}</p>

      <CardFooter>
        <DeleteProjectButton project={props.project} />
        <div className="flex items-end">
          <ExportButton />
          <EditProjectButton project={props.project} />
        </div>
      </CardFooter>

    </div>
  )
}
