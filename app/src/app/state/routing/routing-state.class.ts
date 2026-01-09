import { Logger } from 'app/libs/logger/logger.class'
import { IRouteParams, ROUTE_PARAM_VALUES, SORTED_ROUTES, TAnitaRoute, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { Bucket } from 'app/state/bucket.state'
import { RoutingAtoms } from 'app/state/routing/routing.atoms'
import { NavigateFunction } from 'react-router-dom'

export class RoutingState {
  public static navigate: NavigateFunction

  public static goTo (url: string | number, paramsToFill?: Array<{ name: URL_PARAMS; value: string }>): void {
    if (!paramsToFill || typeof url === 'number') {
      RoutingState.navigate(url as any, { flushSync: true, viewTransition: true })
    } else {
      RoutingState.navigate(urlParamFiller(url, paramsToFill), { flushSync: true, viewTransition: true })
    }
  }

  public static syncFromPath = (rawPath: string) => {
    const [route, params] = RoutingState.parsePath(rawPath)
    RoutingState.commitRouteState(route, params)
  }

  private static parsePath = (rawPath: string): [TAnitaRoute, IRouteParams] | [null, null] => {
    if (!rawPath) {
      return [null, null]
    }
    const sanitizedPath = RoutingState.sanitizePath(rawPath)
    if (!sanitizedPath) {
      return [null, null]
    }

    try {
      const pathParts = sanitizedPath.split('/').filter(Boolean)
      for (const route of SORTED_ROUTES) {
        const routeParts = route.split('/').filter(Boolean)
        const hasParams = routeParts.some((part) => part.startsWith(':'))

        if (hasParams && routeParts.length !== pathParts.length) {
          continue
        }
        if (!hasParams && routeParts.length > pathParts.length) {
          continue
        }

        const params: Partial<Record<URL_PARAMS, string | boolean>> = {}
        let isMatch = true
        let expectedParamsCount = 0

        for (let i = 0; i < routeParts.length; i++) {
          const routePart = routeParts[i]
          const pathPart = pathParts[i]
          if (routePart.startsWith(':')) {
            const paramName = routePart.slice(1)
            if (!ROUTE_PARAM_VALUES.has(paramName) || !pathPart) {
              isMatch = false
              break
            }
            expectedParamsCount += 1
            const param = paramName as URL_PARAMS
            try {
              params[param] = JSON.parse(decodeURIComponent(pathPart)) as string | boolean
            } catch (error) {
              params[param] = decodeURIComponent(pathPart)
            }
            continue
          }
          if (routePart !== pathPart) {
            isMatch = false
            break
          }
        }

        if (!isMatch) {
          continue
        }
        if (expectedParamsCount !== Object.keys(params).length) {
          continue
        }
        return [route, params as IRouteParams]
      }
      return [null, null]
    } catch (error) {
      Logger.error(`[Routing.parsePath]: ${error}`)
      return [null, null]
    }
  }

  private static sanitizePath = (rawPath: string): string | null => {
    if (!rawPath) {
      return null
    }
    let path = rawPath
    if (path.startsWith('#')) {
      path = path.slice(1)
    }
    if (!path.startsWith('/')) {
      path = `/${path}`
    }
    const [pathname] = path.split('?')
    return pathname
  }

  private static commitRouteState = (route: TAnitaRoute | null, params: IRouteParams | null) => {
    if (!Bucket.general) {
      Bucket.createStore()
    }
    if (route) {
      const currentRoute = Bucket.general.get(RoutingAtoms.route)
      if (currentRoute !== route) {
        Bucket.general.set(RoutingAtoms.route, route)
      }
    }
    if (params) {
      const currentParams = Bucket.general.get(RoutingAtoms.params)
      if (!RoutingState.areParamsEqual(currentParams, params)) {
        Bucket.general.set(RoutingAtoms.params, params)
      }
    }
  }

  private static areParamsEqual = (left: IRouteParams | null, right: IRouteParams | null): boolean => {
    if (left === right) {
      return true
    }
    if (!left || !right) {
      return false
    }
    const leftKeys = Object.keys(left) as Array<URL_PARAMS>
    const rightKeys = Object.keys(right) as Array<URL_PARAMS>
    if (leftKeys.length !== rightKeys.length) {
      return false
    }
    for (const key of leftKeys) {
      const leftValue = left[key]
      const rightValue = right[key]
      if (leftValue === rightValue) {
        continue
      }
      if (typeof leftValue === 'object' || typeof rightValue === 'object') {
        if (JSON.stringify(leftValue) !== JSON.stringify(rightValue)) {
          return false
        }
        continue
      }
      return false
    }
    return true
  }
}
