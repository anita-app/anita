import { COLOR_SCHEME, TFill, Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { Icons, TIconName } from 'app/libs/icons/icons.class'
import React from 'react'
import { Link } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'

const sizeClasses = {
  xs: 'rounded px-2.5 py-1.5 text-xs',
  sm: 'rounded-md px-3 py-2 text-sm leading-4',
  md: 'rounded-md px-4 py-2 text-sm',
  lg: 'rounded-md px-4 py-2 text-base',
  xl: 'rounded-md px-6 py-3 text-base'
}

export interface IButtonWithTooltipProps {
  id: string
  label: string
  iconLeft?: TIconName
  iconRight?: TIconName
  iconLeftClassName?: string
  iconRightClassName?: string
  type: Type
  fill?: TFill
  href?: string
  onClick?: (e: React.MouseEvent) => void
  onMouseDown?: (e: React.MouseEvent) => void
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  size?: keyof typeof sizeClasses
  marginClassName?: string
  hasTooltip?: boolean
  tooltip?: string
  className?: string
  labelClassName?: string
  tooltipContainerClassName?: string
  disabled?: boolean
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

const sharedClasses = 'inline-flex items-center justify-center border border-transparent font-medium focus:outline-none focus:ring-2 focus:ring-offset-2'

export const Button: React.FC<IButtonWithTooltipProps> = (props) => {
  const Component = props.href ? Link : 'button'
  const collapsable = (props.hasTooltip || !!props.tooltip) && props.breakpoint
  const fillStyle: TFill = props.fill ?? 'solid'
  const bgClassName = props.disabled ? 'disabled:bg-gray-400 disabled:bg-opacity-40 disabled:cursor-not-allowed' : COLOR_SCHEME[fillStyle].bg[props.type]
  const textClassName = COLOR_SCHEME[fillStyle].text[props.type]

  const handleClick = (e: React.MouseEvent) => {
    if (Component === 'button') {
      e.preventDefault()
      e.stopPropagation()
      props.onClick?.(e)
    }
  }

  return (
    <Component
      to={props.href ? props.href : undefined as any}
      onClick={handleClick}
      onMouseDown={props.onMouseDown ? props.onMouseDown : undefined}
      className={`${sharedClasses} ${props.type !== Type.transparent ? 'shadow-sm' : ''} ${sizeClasses[props.size || 'md']} ${props.className || ''} ${props.marginClassName ?? 'mr-3'} leading-none text-sm rounded ${textClassName} ${bgClassName} focus:outline-none focus:ring-2 focus:ring-offset-2`}
      data-tip={true}
      data-for={props.id}
      disabled={props.disabled ?? false}
    >
      {!!props.iconLeft && Icons.render(props.iconLeft, props.iconLeftClassName)}
      <span className={`${props.iconLeft ? 'ml-2' : ''} ${collapsable ? 'hidden' : ''} ${props.breakpoint ? LabelBreakpoints[props.breakpoint] : ''} ${props.labelClassName ?? ''}`}>{props.label}</span>
      {!!props.iconRight && Icons.render(props.iconRight, `ml-2 ${props.iconRightClassName || ''}`)}
      {(props.hasTooltip || props.tooltip) && (
        <span className={props.breakpoint ? TooltipBreakpoints[props.breakpoint] : props.tooltipContainerClassName || ''}>
          <ReactTooltip id={props.id} effect="solid">
            {props.tooltip || props.label}
          </ReactTooltip>
        </span>
      )}
    </Component>
  )
}
