import { Icons } from 'app/libs/icons/icons.class'
import React from 'react'
import ReactTooltip from 'react-tooltip'

interface IFormElementLabelProps {
  label: string
  labelHint?: string
}

export const FormElementLabel = ({ label, labelHint }: IFormElementLabelProps) => (
  <div className="w-full block">
    <label className="mb-0 ml-1 text-gray-700 text-sm">{label}</label>
    {labelHint && (
      <>
        <i className="text-gray-500 text-sm ml-1" data-tip={true} data-for={encodeURIComponent(label)}>{Icons.render('informationCircleOutline')}</i>
        <ReactTooltip id={encodeURIComponent(label)} effect="solid" place="right">
          {labelHint}
        </ReactTooltip>
      </>
    )}
  </div>
)
