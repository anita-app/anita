import React, { ReactNode } from 'react'

interface IProjectSectionListTableTdWithoutLinkProps {
  children: ReactNode
}

export const ProjectSectionListTableBodyTrTdWithoutLink: React.FC<IProjectSectionListTableTdWithoutLinkProps> = (props) => (
  <td
    className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0 flex justify-center"
  >
    {props.children}
  </td>
)
