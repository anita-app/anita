import React from 'react'
import { Link } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'

interface IButtonWithTooltipProps {
  id: string
  label: string
  icon?: string
  textColorClassName?: string
  bgColorClassName?: string
  href?: string
  onClick?: () => void
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  marginClassName?: string
  hasTooltip?: boolean
  tooltip?: string
}

enum LabelBreakpoints {
  sm = 'sm:inline-block',
  md = 'md:inline-block',
  lg = 'lg:inline-block',
  xl = 'xl:inline-block',
  xxl = 'xxl:inline-block'
}

enum TooltipBreakpoints {
  sm = 'sm:hidden',
  md = 'md:hidden',
  lg = 'lg:hidden',
  xl = 'xl:hidden',
  xxl = 'xxl:hidden'
}

export const Button: React.FC<IButtonWithTooltipProps> = (props) => {
  const Component = props.href ? Link : 'button'
  const collapsable = (props.hasTooltip || !!props.tooltip) && props.breakpoint
  return (
    <Component
      to={props.href ? props.href : null}
      onClick={props.onClick ? props.onClick : null}
      className={`px-4 py-3 ${props.marginClassName ?? 'mr-3'} inline-flex items-center ml-auto leading-none text-sm rounded ${props.textColorClassName ?? 'text-gray-800'} ${props.bgColorClassName ?? 'bg-gray-100 hover:bg-gray-200'}`}
      data-tip={true}
      data-for={props.id}
    >
      {!!props.icon && <i className={props.icon}></i>}<span className={`${props.icon ? 'ml-2' : ''} ${collapsable ? 'hidden' : ''} ${props.breakpoint ? LabelBreakpoints[props.breakpoint] : ''}`}>{props.label}</span>
      {props.hasTooltip && (
        <span className={props.breakpoint ? TooltipBreakpoints[props.breakpoint] : ''}>
          <ReactTooltip id={props.id} effect="solid">
            {props.tooltip || props.label}
          </ReactTooltip>
        </span>
      )}
    </Component>
  )
}
