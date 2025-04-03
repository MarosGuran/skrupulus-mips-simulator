// src-pwa/register-service-worker.ts
import { register } from 'register-service-worker';

// Use a simple version counter for development
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const APP_VERSION = '1.0.0';

console.log('Registering service worker with file:', process.env.SERVICE_WORKER_FILE);

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
register(process.env.SERVICE_WORKER_FILE as string, {
  registrationOptions: { scope: '/' },

  ready() {
    console.log('Service worker is active.');
  },

  registered(registration) {
    console.log('Service worker has been registered:', registration.scope);

    // Set up periodic updates (once per hour)
    setInterval(() => {
      registration.update().catch(error => {
        console.error('Error updating service worker:', error);
      });
    }, 60 * 60 * 1000);
  },

  cached() {
    console.log('Content has been cached for offline use.');
  },

  updatefound() {
    console.log('New content is downloading.');
  },

  updated(registration) {
    console.log('New content is available.');
    document.dispatchEvent(
      new CustomEvent('swUpdated', { detail: registration })
    );
  },

  offline() {
    console.log('No internet connection found. App is running in offline mode.');
  },

  error(error) {
    console.error('Error during service worker registration:', error);
  }
});
