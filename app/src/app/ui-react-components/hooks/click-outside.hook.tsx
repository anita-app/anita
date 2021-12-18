import { useEffect } from 'react'

export const useClickOutside = (parentElement: React.RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    // check if the click is inside a div with classs dueDateFieldDropup
    const onClickOutside = (e: MouseEvent) => {
      if (parentElement?.current && !parentElement.current!.contains(e.target as Node)) {
        callback()
      }
    }

    document.addEventListener('click', onClickOutside)

    return () => {
      document.removeEventListener('click', onClickOutside)
    }
  }, [parentElement, callback])
}
