import { register } from 'register-service-worker';

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
register(process.env.SERVICE_WORKER_FILE as string, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (/* registration */) {
    console.log('App is being served from cache by a service worker.')

    // Manually prefetch CodeMirror resources when the app loads
    if ('serviceWorker' in navigator && 'caches' in window) {
      const codeMirrorResources = [
        'codemirror/lib/codemirror.js',
        'codemirror/lib/codemirror.css',
        'codemirror/theme/base16-light.css'
      ];

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      caches.open('codemirror-js-cache').then(cache => {
        codeMirrorResources.forEach(url => {
          fetch(url).then(response => {
            if (response.ok) {
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              cache.put(url, response);
            }
          }).catch(err => {
            console.error('Failed to fetch:', url, err);
          });
        });
      });
    }
  },

  registered (/* registration */) {
    // console.log('Service worker has been registered.')
  },

  cached (/* registration */) {
    // console.log('Content has been cached for offline use.')
  },

  updatefound (/* registration */) {
    // console.log('New content is downloading.')
  },

  updated (/* registration */) {
    // console.log('New content is available; please refresh.')
  },

  offline () {
    // console.log('No internet connection found. App is running in offline mode.')
  },

  error (/* err */) {
    // console.error('Error during service worker registration:', err)
  },
});
