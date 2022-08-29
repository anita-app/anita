import { COLOR_SCHEME, TFillStyle, TStatus } from 'app/ui-react-components/shared-components/common-ui-eles/components.const'
import React from 'react'
import { Link } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'

interface IButtonWithTooltipProps {
  id: string
  label: string
  icon?: string
  status: TStatus
  fillStyle?: TFillStyle
  href?: string
  onClick?: () => void
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  size?: 'sm' | 'md' | 'lg'
  marginClassName?: string
  hasTooltip?: boolean
  tooltip?: string
  className?: string
  labelClassName?: string
  tooltipContainerClassName?: string
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
  const fillStyle: TFillStyle = props.fillStyle ?? 'solid'
  const bgClassName = COLOR_SCHEME[fillStyle].bg[props.status]
  const textClassName = COLOR_SCHEME[fillStyle].text[props.status]
  const padding = props.size === 'sm' ? 'py-1 px-3' : props.size === 'lg' ? 'py-3 px-6' : 'py-3 px-4'
  return (
    <Component
      to={props.href ? props.href : null}
      onClick={props.onClick ? props.onClick : null}
      className={`${props.className || ''} ${padding} ${props.marginClassName ?? 'mr-3'} inline-flex items-center leading-none text-sm rounded ${textClassName} ${bgClassName}`}
      data-tip={true}
      data-for={props.id}
    >
      {!!props.icon && <i className={props.icon}></i>}<span className={`${props.icon ? 'ml-2' : ''} ${collapsable ? 'hidden' : ''} ${props.breakpoint ? LabelBreakpoints[props.breakpoint] : ''} ${props.labelClassName || ''}`}>{props.label}</span>
      {props.hasTooltip && (
        <span className={props.breakpoint ? TooltipBreakpoints[props.breakpoint] : props.tooltipContainerClassName || ''}>
          <ReactTooltip id={props.id} effect="solid">
            {props.tooltip || props.label}
          </ReactTooltip>
        </span>
      )}
    </Component>
  )
}
