export enum Type {
  primary = 'primary',
  secondary = 'secondary',
  success = 'success',
  info = 'info',
  warning = 'warning',
  danger = 'danger',
  transparent = 'transparent',
}

export enum SolidBg {
  primary = 'bg-prussian-blue-400/80',
  secondary = 'bg-gray-100/80',
  success = 'bg-green-500/80',
  info = 'bg-blue-500/80',
  warning = 'bg-orange-700/80',
  danger = 'bg-red-600/80',
  transparent = 'bg-transparent/80',
}

// The primary look (ui-btn-primary) is defined in ui.css: a light blue gradient with a colored shadow.
export enum SolidBgWithHover {
  primary = 'ui-btn-primary border-transparent',
  secondary = 'bg-white border-[#dfe5ee] shadow-[0_1px_2px_rgba(0,35,70,0.06)] hover:bg-[#f9fbfe] hover:border-[#c4d2e3]',
  success = 'bg-green-500 border-transparent hover:bg-green-600',
  // Same as primary: one blue for every main action.
  info = 'ui-btn-primary border-transparent',
  warning = 'bg-orange-700/10 border-transparent hover:bg-orange-700/20',
  danger = 'bg-red-600 border-transparent hover:bg-red-700',
  transparent = 'bg-transparent border-transparent hover:bg-[#eef3f9]',
}

export enum SolidText {
  primary = 'text-white',
  secondary = 'text-[#1e2b3c]',
  success = 'text-white',
  info = 'text-white',
  warning = 'text-orange-700 hover:text-orange-800',
  danger = 'text-white',
  transparent = 'text-gray-600 hover:text-prussian-blue-500',
}

export enum OutlineBg {
  primary = 'bg-white border-prussian-blue-300/40 hover:bg-[#f2f7fd] hover:border-prussian-blue-300',
  secondary = 'bg-transparent border-gray-200 hover:bg-gray-50',
  success = 'bg-white border-green-500/50 hover:bg-green-50',
  info = 'bg-white border-blue-500/50 hover:bg-blue-50',
  warning = 'bg-white border-orange-700/40 hover:bg-orange-50',
  danger = 'bg-white border-[#f4d2d4] hover:bg-[#fff5f5] hover:border-[#eeb4b8]',
  transparent = 'bg-transparent border-transparent hover:bg-gray-100',
}

export enum OutlineText {
  primary = 'text-prussian-blue-400',
  secondary = 'text-gray-700 hover:text-gray-800',
  success = 'text-green-600',
  info = 'text-blue-600',
  warning = 'text-orange-700',
  danger = 'text-[#c0262d]',
  transparent = 'text-gray-700 hover:text-gray-800',
}

export const COLOR_SCHEME = {
  solid: {
    bg: SolidBgWithHover,
    text: SolidText,
  },
  outline: {
    bg: OutlineBg,
    text: OutlineText,
  },
}

export type TFill = keyof typeof COLOR_SCHEME
