import React from 'react'

interface IFormElementLabelProps {
  label: string
}

export const FormElementLabel = ({ label }: IFormElementLabelProps) => (
  <label className="w-full block mb-0 ml-1 text-gray-700 text-sm">{label}</label>
)
