import React, { useState } from 'react'

interface IPasswordProps {
  value: string
}

export const Password: React.FC<IPasswordProps> = ({ value }) => {
  const [showPassword, setShowPassword] = useState(false)

  if (!value) return null

  return (
    <>
      {showPassword
        ? value
        : value.replace(/./g, '*')}
      <button
        type="button"
        className={showPassword ? 'bi-eye-slash-fill ml-3' : 'bi-eye-fill ml-3'}
        onClick={() => setShowPassword(!showPassword)}
      >
        <i />
      </button>
    </>
  )
}
