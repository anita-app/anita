import React, { ReactNode } from 'react'

interface IProjectSectionListTableTdWithoutLinkProps {
  tdProps: {}
  children: ReactNode
}

export const ProjectSectionListTableTdWithoutLink: React.FC<IProjectSectionListTableTdWithoutLinkProps> = (props) => (
  <td
    className="px-6 py-4"
    {...props.tdProps}
  >
    {props.children}
  </td>
)
