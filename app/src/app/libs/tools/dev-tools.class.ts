import * as React from 'react'

export class DevTools {
  /**
   * Detect if React is in development mode
   */
  public static isReactDev (): boolean {
    return '_self' in React.createElement('div')
  }
}
