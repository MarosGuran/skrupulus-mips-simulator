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

        <q-btn
          flat
          round
          icon="picture_as_pdf"
          color="white"
          @click="openPdf"
          class="q-mr-md"
          :aria-label="'Open Documentation PDF'"
        >
          <q-tooltip>Documentation</q-tooltip>
        </q-btn>

        <speedBar />
      </q-toolbar>
    </q-header>

    <q-page-container class="app" style="min-height: inherit;">
      <div class="editor-registers-container">
        <CodeMirrorEditor />
        <memoryComponent />
      </div>
      <visualizationComponent />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CodeMirrorEditor from '../components/CodeMirrorEditor.vue'
import memoryComponent from '../components/memoryComponent.vue'
import visualizationComponent from 'src/components/visualizationComponent.vue'
import speedBar from 'src/components/speedBar.vue'

export default defineComponent({
  name: 'MainLayout',
  components: {
    CodeMirrorEditor,
    memoryComponent,
    visualizationComponent,
    speedBar,
  },
  methods: {
    openPdf() {
      const pdfUrl = '/public/manuálSkrupulusMipsSimulator.pdf';

      window.open(pdfUrl, '_blank');
    }
  }
})
</script>

<style scoped>
.editor-registers-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.app {
  display: flex;
  gap: 20px;
  padding: 20px;
}
</style>
