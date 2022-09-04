export enum Type {
  primary = 'primary',
  secondary = 'secondary',
  success = 'success',
  info = 'info',
  warning = 'warning',
  danger = 'danger'
}

export enum SolidBg {
  primary = 'bg-prussian-blue-400 hover:bg-prussian-blue-500 focus:ring-prussian-blue-400',
  secondary = 'bg-gray-100 hover:bg-gray-200 focus:ring-gray-100',
  success = 'bg-green-500 hover:bg-green-600 focus:ring-green-500',
  info = 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
  warning = 'bg-orange-700 bg-opacity-10 hover:bg-opacity-20 focus:ring-orange-700 focus:ring-opacity-10',
  danger = 'bg-red-700 bg-opacity-10 hover:bg-opacity-20 focus:ring-red-700 focus:ring-opacity-10'
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
  primary = 'bg-transparent border border-prussian-blue hover:bg-prussian-blue-400 focus:ring-prussian-blue-400',
  secondary = 'bg-transparent border border-gray-100 hover:bg-gray-100 focus:ring-gray-100',
  success = 'bg-transparent border border-green-500 hover:bg-green-500 focus:ring-green-500',
  info = 'bg-transparent border border-blue-500 hover:bg-blue-500 focus:ring-blue-500',
  warning = 'bg-transparent border border-orange-700 hover:bg-orange-700 bg-opacity-10 focus:ring-orange-700 focus:ring-opacity-10',
  danger = 'bg-transparent border border-red-700 hover:bg-red-700 bg-opacity-10 focus:ring-red-700 focus:ring-opacity-10'
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

export type TFill = keyof typeof COLOR_SCHEME
