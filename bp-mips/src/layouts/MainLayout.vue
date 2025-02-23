<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar>
          SKRUPULUS MIPS simulator
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container style="min-height: inherit;">
      <CodeMirrorEditor />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CodeMirrorEditor from '../components/CodeMirrorEditor.vue'

export default defineComponent({
  name: 'MainLayout',
  components: {
    CodeMirrorEditor,
  },
})
</script>
