import { Icons, TIconName } from 'app/libs/icons/icons.class'
import React, { useState } from 'react'

interface IPasswordProps {
  value: string
}

export const Password: React.FC<IPasswordProps> = ({ value }) => {
  const [showPassword, setShowPassword] = useState(false)

  if (!value) return null

  const icon: TIconName = showPassword ? 'eyeOffOutline' : 'eyeOutline'
  const valueToShow = showPassword ? value : value.replace(/./g, '*')
  return (
    <>
      {valueToShow}
      <button
        type="button"
        className="ml-3"
        onClick={() => setShowPassword(!showPassword)}
      >
        {Icons.render(icon)}
      </button>
    </>
  )
}
