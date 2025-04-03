<template>
  <div v-if="updateAvailable" class="update-notification">
    <q-banner class="bg-primary text-white">
      <template v-slot:avatar>
        <q-icon name="update" />
      </template>
      <span>New version available!</span>
      <template v-slot:action>
        <q-btn flat label="Update" @click="updateNow" />
      </template>
    </q-banner>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

export default defineComponent({
  name: 'ServiceWorkerUpdater',
  setup() {
    const updateAvailable = ref(false)
    let registration: ServiceWorkerRegistration | null = null

    const updateNow = () => {
      if (registration && registration.waiting) {
        void registration.waiting.postMessage({ type: 'SKIP_WAITING' })

        window.location.reload()
      }
    }

    onMounted(() => {
      if ('serviceWorker' in navigator) {
        void navigator.serviceWorker.ready.then(reg => {
          registration = reg

          if (reg.waiting) {
            updateAvailable.value = true
            return
          }

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing

            if (!newWorker) return

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                updateAvailable.value = true
              }
            })
          })

          setInterval(() => {
            console.log('Checking for service worker updates...')
            void reg.update().catch(err => {
              console.error('Error checking for service worker updates:', err)
            })
          }, 60 * 60 * 1000)
        }).catch(error => {
          console.error('Service worker registration failed:', error)
        })

        let refreshing = false
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return
          refreshing = true
          console.log('Service Worker controller changed, reloading page...')
          window.location.reload()
        })
      }
    })

    return {
      updateAvailable,
      updateNow
    }
  }
})
</script>

<style scoped>
.update-notification {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}
</style>
