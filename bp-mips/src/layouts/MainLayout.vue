<template>
  <!-- Main layout -->
  <q-layout view="hHh lpR fFf">
    <!-- Application header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <!-- Application title with Quasar logo -->
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar>
          SKRUPULUS MIPS simulator
        </q-toolbar-title>

        <!-- Documentation PDF button -->
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

        <!-- Simulation speed control component -->
        <speedBar />
      </q-toolbar>
    </q-header>

    <!-- Main content container -->
    <q-page-container class="app" style="min-height: inherit">
      <!-- Container for the code editor and register/memory display -->
      <div class="editor-registers-container">
        <!-- Code editor component for MIPS assembly input -->
        <CodeMirrorEditor />
        <!-- Memory and register component -->
        <memoryComponent />
      </div>
      <!-- Visualization component -->
      <visualizationComponent />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
/**
 * @component MainLayout
 * @description Main application layout for the SKRUPULUS MIPS Simulator.
 * This component serves as the primary container for all simulator components,
 * organizing them into a cohesive interface with a header and main content area.
 */
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
    /**
     * Opens the simulator's user manual PDF in a new browser tab.
     */
    openPdf() {
      const pdfUrl = '/public/manuálSkrupulusMipsSimulator.pdf'

      window.open(pdfUrl, '_blank')
    },
  },
})
</script>

<style scoped>
/* Flex container for code editor and registers view with spacing between them */
.editor-registers-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* Main application container with flexible layout and consistent padding */
.app {
  display: flex;
  gap: 20px;
  padding: 20px;
}
</style>
