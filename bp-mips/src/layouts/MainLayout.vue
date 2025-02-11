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

    <q-page-container>
      <textarea id="editorContainer" style="height: 90vh; width: 100%"></textarea>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const CodeMirror: any

export default defineComponent({
  name: 'MainLayout',
  setup() {
    onMounted(() => {
      const textarea = document.getElementById('editorContainer')
      if (textarea) {
        const editor = CodeMirror.fromTextArea(textarea, {
          lineNumbers: true,
          mode: 'python',
          theme: 'base16-light',
          lineNumberFormatter: (line: number) => {
            return (line - 1).toString(16).toUpperCase().padStart(4, '0')
          },
          extraKeys: { 'Ctrl-Space': 'autocomplete' },
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        editor.on('inputRead', function onInputRead(cm: any, change: any) {
          if (change.text[0] && /[a-zA-Z]/.test(change.text[0])) {
            cm.showHint({ completeSingle: false })
          }
        })
      }
    })

    return {}
  },
})
</script>

<style scoped>
/* Optional styling */
</style>
