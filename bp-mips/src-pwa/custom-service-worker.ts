/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config file > pwa > workboxMode is set to "InjectManifest"
 */

// src-pwa/custom-service-worker.ts
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Simple version for basic functionality
console.log('Service Worker: Loading basic version');

// Skip the waiting phase and activate immediately
// eslint-disable-next-line @typescript-eslint/no-unused-vars
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  self.skipWaiting();
});

// Claim clients when activated
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(self.clients.claim());
});

// Network-only strategy - no caching
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // For all requests, use network only
  event.respondWith(
    fetch(event.request)
      .catch(error => {
        console.error('Fetch error:', error);
        return new Response('Network error', { status: 503 });
      })
  );
});

// Listen for message to skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    self.skipWaiting();
  }
});

console.log('Service Worker: Basic initialization complete');
