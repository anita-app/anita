import { Icons } from 'app/libs/icons/icons.class'
import { useState } from 'react'
import type { FC } from 'react'
import type { TIconName } from 'app/libs/icons/icons.class'

interface IPasswordProps {
  value: string
}

export const Password: FC<IPasswordProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false)

  if (!props.value) return null

  const icon: TIconName = showPassword ? 'eyeOffOutline' : 'eyeOutline'
  const valueToShow = showPassword ? props.value : props.value.replace(/./g, '*')
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
