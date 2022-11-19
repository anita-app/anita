function getPlatform () {
  // 2022 way of detecting. Note : this userAgentData feature is available only in secure contexts (HTTPS)
  if (typeof (navigator as any).userAgentData !== 'undefined' && (navigator as any).userAgentData != null) {
    return (navigator as any).userAgentData.platform
  }
  // Deprecated but still works for most of the browser
  if (typeof navigator.platform !== 'undefined') {
    if (typeof navigator.userAgent !== 'undefined' && /android/.test(navigator.userAgent.toLowerCase())) {
      // android device’s navigator.platform is often set as 'linux', so let’s use userAgent for them
      return 'android'
    }
    return navigator.platform
  }
  return 'unknown'
}

const platform = getPlatform().toLowerCase()

const isOSX = /mac/.test(platform)
const isIOS = ['iphone', 'ipad', 'ipod'].indexOf(platform)
/** For detecting phones vs. tablets, see:
  * https://stackoverflow.com/questions/9533106/detect-phone-vs-tablet
  * https://developers.google.com/search/blog/2011/03/mo-better-to-also-detect-mobile-user
  * */
const isPhone = (/mobile/i.test(navigator.userAgent) && !/ipad|tablet/i.test(navigator.userAgent))

export const PLATFORM = {
  IS_MAC: isOSX,
  IS_IOS: isIOS,
  IS_APPLE: isOSX || isIOS,
  IS_PHONE: isPhone,
  IS_WIN: /win/.test(platform),
  IS_ANDROID: /android/.test(platform),
  IS_LINUX: /linux/.test(platform),
  IS_WEB: true
}
