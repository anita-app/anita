export type TStatus = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger'

export enum SolidBg {
  primary = 'bg-prussian-blue-400 hover:bg-prussian-blue-500',
  secondary = 'bg-gray-100 hover:bg-gray-200',
  success = 'bg-green-500 hover:bg-green-600',
  info = 'bg-blue-500 hover:bg-blue-600',
  warning = 'bg-orange-700 bg-opacity-10 hover:bg-opacity-20',
  danger = 'bg-red-700 bg-opacity-10 hover:bg-opacity-20'
}

export enum SolidText {
  primary = 'text-white',
  secondary = 'text-gray-800',
  success = 'text-white',
  info = 'text-white',
  warning = 'text-orange-700',
  danger = 'text-red-700'
}

export enum OutlineBg {
  primary = 'bg-transparent border border-prussian-blue hover:bg-prussian-blue-400',
  secondary = 'bg-transparent border border-gray-100 hover:bg-gray-100',
  success = 'bg-transparent border border-green-500 hover:bg-green-500',
  info = 'bg-transparent border border-blue-500 hover:bg-blue-500',
  warning = 'bg-transparent border border-orange-700 hover:bg-orange-700 bg-opacity-10',
  danger = 'bg-transparent border border-red-700 hover:bg-red-700 bg-opacity-10'
}

export enum OutlineText {
  primary = 'text-prussian-blue hover:text-white',
  secondary = 'text-gray-700 hover:text-gray-800',
  success = 'text-green-500 hover:text-white',
  info = 'text-blue-500 hover:text-white',
  warning = 'text-orange-700 hover:text-white',
  danger = 'text-red-700 hover:text-white'
}

export const COLOR_SCHEME = {
  solid: {
    bg: SolidBg,
    text: SolidText
  },
  outline: {
    bg: OutlineBg,
    text: OutlineText
  }
}

export type TFillStyle = keyof typeof COLOR_SCHEME
