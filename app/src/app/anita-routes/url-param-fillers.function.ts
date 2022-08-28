import { URL_PARAMS } from 'app/anita-routes/anita-routes.constant'

/**
 * Accepts a url and a param and replaces all the occurences of the url param with a given value
 */
export function urlParamFiller (url: string, paramsToFill: Array<{ name: URL_PARAMS; value: string }>): string {
  let result = url
  paramsToFill.forEach(params => {
    result = result.replace(new RegExp(`:${params.name}`, 'g'), params.value)
  })
  return result
}
