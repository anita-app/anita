import React from 'react'
import { Link } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'

interface IButtonWithTooltipProps {
  id: string
  label: string
  icon: string
  textColorClassName?: string
  bgColorClassName?: string
  href?: string
  onClick?: () => void
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
}

export enum LabelBreakpoints {
  sm = 'sm:inline-block',
  md = 'md:inline-block',
  lg = 'lg:inline-block',
  xl = 'xl:inline-block',
  xxl = 'xxl:inline-block'
}

export enum TooltipBreakpoints {
  sm = 'sm:hidden',
  md = 'md:hidden',
  lg = 'lg:hidden',
  xl = 'xl:hidden',
  xxl = 'xxl:hidden'
}

export const ButtonWithTooltip: React.FC<IButtonWithTooltipProps> = (props) => {
  const Component = props.href ? Link : 'button'

  return (
    <Component
      to={props.href ? props.href : null}
      onClick={props.onClick ? props.onClick : null}
      className={`px-4 py-3 mr-3 inline-flex items-center ml-auto leading-none text-sm rounded ${props.textColorClassName ?? 'text-gray-800'} ${props.bgColorClassName ?? 'bg-gray-100 hover:bg-gray-200'}`}
      data-tip={true}
      data-for={props.id}
    >
      <i className={props.icon}></i> <span className={`ml-2 hidden ${props.breakpoint ? LabelBreakpoints[props.breakpoint] : LabelBreakpoints.sm}`}>{props.label}</span>
      <span className={props.breakpoint ? TooltipBreakpoints[props.breakpoint] : TooltipBreakpoints.sm}>
        <ReactTooltip id={props.id} effect="solid">
          {props.label}
        </ReactTooltip>
      </span>
    </Component>
  )
}
