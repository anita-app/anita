/* eslint-disable no-console */
// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

/**
 * @feature app.install
 * @title Install Anita as an app
 * @summary Add Anita to the home screen, dock or start menu and open it in its own window like any other app.
 * @where The browser's install option (install icon in the address bar, or "Add to Home Screen" / "Install app" in the browser menu) while Anita is open.
 * @usage 1. Open Anita in a browser that supports installing web apps (for example Chrome, Edge, Safari on iPhone and iPad).
 * 2. Choose "Install" or "Add to Home Screen" in the browser.
 * 3. Open Anita from its icon: it starts on the projects list in its own window, without the browser bars.
 * @options none
 * @rules The installed app is the same Anita as the web page, works offline and gets the same updates.
 * On computers and Android the installed app usually shares the data of the browser it was installed from; on iPhone and iPad an app added to the Home Screen keeps its own data, separate from Safari, and removing it can delete that data: sync or export your projects to move them between the two.
 * Installing needs a browser that supports it; in the others Anita keeps working as a normal web page.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @related app.offline, app.updates, storage.local-database
 */
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/),
)

interface Config {
  onSuccess?: (registration: ServiceWorkerRegistration) => void
  onUpdate?: (registration: ServiceWorkerRegistration) => void
}

/**
 * @feature app.updates
 * @title App updates
 * @summary New versions of Anita are downloaded automatically and used the next time the app is opened.
 * @where Automatic; the version in use is shown at the bottom of the sidebar.
 * @usage Nothing to do. To start using a new version, close every tab and window of Anita (also the installed app) and open it again.
 * @options none
 * @rules When you open Anita while online, it checks for a new version and downloads it in the background.
 * The new version is used only after all the tabs and windows of Anita have been closed; until then the current one keeps running. No message is shown when an update is ready.
 * Updates never touch your data, which stays in the browser.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @related app.offline, app.install
 */
export function register (config?: Config) {
  function registerValidSW (swUrl: string, config?: Config) {
    navigator.serviceWorker
      .register(swUrl, { scope: import.meta.env.BASE_URL })
      .then((registration) => {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing
          if (installingWorker == null) {
            return
          }
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // At this point, the updated precached content has been fetched,
                // but the previous service worker will still serve the older
                // content until all client tabs are closed.
                console.log(
                  'New content is available and will be used when all ' +
                    'tabs for this page are closed.',
                )

                // Execute callback
                if (config && config.onUpdate) {
                  config.onUpdate(registration)
                }
              } else {
                // At this point, everything has been precached.
                // It's the perfect time to display a
                // "Content is cached for offline use." message.
                console.log('Content is cached for offline use.')

                // Execute callback
                if (config && config.onSuccess) {
                  config.onSuccess(registration)
                }
              }
            }
          }
        }
      })
      .catch((error) => {
        console.error('Error during service worker registration:', error)
      })
  }

  function checkValidServiceWorker (swUrl: string, config?: Config) {
    // Check if the service worker can be found. If it can't reload the page.
    fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
    })
      .then((response) => {
        // Ensure service worker exists, and that we really are getting a JS file.
        const contentType = response.headers.get('content-type')
        if (
          response.status === 404 ||
          (contentType != null && contentType.indexOf('javascript') === -1)
        ) {
          // No service worker found. Probably a different app. Reload the page.
          navigator.serviceWorker.ready.then((registration) => {
            registration.unregister().then(() => {
              window.location.reload()
            })
          })
        } else {
          // Service worker found. Proceed as normal.
          registerValidSW(swUrl, config)
        }
      })
      .catch(() => {
        console.log('No internet connection found. App is running in offline mode.')
      })
  }

  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(import.meta.env.BASE_URL, window.location.href)
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if the base URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets.
      return
    }

    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}service-worker.js`

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config)

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker.',
          )
        })
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config)
      }
    })
  }
}

/**
 * @internal
 */
export function unregister () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
      })
      .catch((error) => {
        console.error(error.message)
      })
  }
}
