import { useEffect, useRef } from 'react'
import tippy, { Instance } from 'tippy.js'

export const useTippyTooltip = (elementId: string, content?: string, additionalClasses?: string): void => {
  const instancesRef = useRef<Array<Instance> | undefined>()
  window.requestAnimationFrame(() => {
    if (!content || instancesRef.current?.length) {
      return
    }
    instancesRef.current = tippy(`#${elementId}`, {
      content,
      trigger: 'mouseenter'
    })
    if (additionalClasses) {
      instancesRef.current?.forEach((i) => {
        i.props.onShow = (i) => {
          i.popper.classList.add(additionalClasses)
        }
      })
    }
  })
  useEffect(() => () => {
    instancesRef.current?.every((i) => i.destroy())
  }
  , [])
}
