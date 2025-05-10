<template>
  <!-- Update notification banner, only visible when updates are available -->
  <div v-if="updateAvailable" class="update-notification">
    <q-banner class="bg-primary text-white">
      <!-- Update icon in the avatar slot -->
      <template v-slot:avatar>
        <q-icon name="update" />
      </template>
      <!-- Update notification message -->
      <span>New version available!</span>
      <!-- Update action button -->
      <template v-slot:action>
        <q-btn flat label="Update" @click="updateNow" />
      </template>
    </q-banner>
  </div>
</template>

<script lang="ts">
/**
 * @component ServiceWorkerUpdater
 * @description Handles progressive web app updates through service workers.
 * Displays a notification banner when a new version of the application is available,
 * allowing users to update with a single click.
 */
import { defineComponent, ref, onMounted } from 'vue'

export default defineComponent({
  name: 'ServiceWorkerUpdater',
  setup() {
    const updateAvailable = ref(false)
    let registration: ServiceWorkerRegistration | null = null

    /**
     * Triggers the application update process.
     * Instructs the waiting service worker to activate and reloads the page
     * to apply the new version.
     */
    const updateNow = () => {
      if (registration && registration.waiting) {
        void registration.waiting.postMessage({ type: 'SKIP_WAITING' })

        window.location.reload()
      }
    }

    /**
     * Sets up service worker event listeners and update detection.
     * Initializes periodic update checks and handles the update notification state.
     */
    onMounted(() => {
      if ('serviceWorker' in navigator) {
        void navigator.serviceWorker.ready.then(reg => {
          registration = reg

          // If there's already a waiting service worker, show update notification
          if (reg.waiting) {
            updateAvailable.value = true
            return
          }

          // Listen for new service worker installation
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing

            if (!newWorker) return

            // Monitor the new service worker's state changes
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                updateAvailable.value = true
              }
            })
          })

          // Set up periodic update checks (hourly)
          setInterval(() => {
            console.log('Checking for service worker updates...')
            void reg.update().catch(err => {
              console.error('Error checking for service worker updates:', err)
            })
          }, 60 * 60 * 1000)
        }).catch(error => {
          console.error('Service worker registration failed:', error)
        })

        // Handle service worker controller changes
        let refreshing = false
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return
          refreshing = true
          console.log('Service Worker controller changed, reloading page...')
          window.location.reload()
        })
      }
    })

    // Expose reactive state and methods to the template
    return {
      updateAvailable,
      updateNow
    }
  }
})
</script>

<style scoped>
/**
 * Component-specific styles for the update notification
 */

/* Fixed position notification banner at the bottom of the viewport */
.update-notification {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}
</style>
