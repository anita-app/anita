import { Logger } from 'app/libs/logger/logger.class'
import { IRouteParams, ROUTE_PARAM_VALUES, SORTED_ROUTES, TAnitaRoute, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { Bucket } from 'app/state/bucket.state'
import { RoutingAtoms } from 'app/state/routing/routing.atoms'

export class RoutingState {
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
      for (const route of SORTED_ROUTES) {
        const routeWithoutParams = route.split('/:')[0]
        if (sanitizedPath.startsWith(routeWithoutParams)) {
          // if it does, parse the params and return the route
          const params: Partial<Record<URL_PARAMS, string | boolean>> = {}
          const expectedParams = route.replace(routeWithoutParams, '').split('/:').filter(Boolean)
          if (expectedParams.length) {
            const pathParts = sanitizedPath.replace(`${routeWithoutParams}/`, '').split('/')
            for (let i = 0, len = expectedParams.length; i < len; i++) {
              const expectedParam = expectedParams[i]
              if (!ROUTE_PARAM_VALUES.has(expectedParam)) {
                continue
              }
              const param = expectedParam as URL_PARAMS
              const paramValue = pathParts[i]
              if (paramValue) {
                try {
                  params[param] = JSON.parse(decodeURIComponent(paramValue)) as string | boolean
                } catch (error) {
                  params[param] = decodeURIComponent(paramValue)
                }
              }
            }
          }
          if (expectedParams.length !== Object.keys(params).length) {
            continue
          }
          return [route, params as IRouteParams]
        }
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
