import React from 'react'
import { Link } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'

interface IButtonWithTooltipProps {
  id: string
  label: string
  icon: string
  bgColorClassName?: string
  href?: string
  handleClick?: () => void
}

export const ButtonWithTooltip: React.FC<IButtonWithTooltipProps> = (props) => {
  if (props.href) {
    return (
      <Link
        to={props.href}
        className={`px-4 py-3 text-gray-800 mr-3 inline-flex items-center ml-auto leading-none text-sm rounded ${props.bgColorClassName ?? 'bg-gray-100 hover:bg-gray-200'}`}
        data-tip={true}
        data-for={props.id}
      >
        <i className={props.icon}></i> <span className="ml-2 hidden sm:inline-block">{props.label}</span>
        <span className="sm:hidden">
          <ReactTooltip id={props.id} effect="solid">
            {props.label}
          </ReactTooltip>
        </span>
      </Link>
    )
  }
}
