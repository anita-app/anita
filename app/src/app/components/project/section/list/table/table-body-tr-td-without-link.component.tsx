import type { FC, ReactNode } from 'react'

interface IProjectSectionListTableTdWithoutLinkProps {
  children: ReactNode
}

export const ProjectSectionListTableBodyTrTdWithoutLink: FC<IProjectSectionListTableTdWithoutLinkProps> = (props) => (
  <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-[#334155] sm:pl-3">
    {props.children}
  </td>
)
