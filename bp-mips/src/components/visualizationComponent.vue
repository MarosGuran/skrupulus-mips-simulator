<template>
  <!-- Main container for pipeline visualization and architecture diagram -->
  <div class="visualization-container">
    <!-- Pipeline stages display container -->
    <div class="pipeline-container">
      <table class="fixed-table">
        <!-- Pipeline stage headers -->
        <thead>
          <tr>
            <th v-for="(header, i) in pipelineHeaders"
                :key="`header-${i}`"
                class="fixed-column">
              {{ header }}
            </th>
          </tr>
        </thead>
        <!-- Current instruction in each pipeline stage -->
        <tbody>
          <tr>
            <td v-for="(stage, index) in store.stages"
                :key="`${index}-${stage}`"
                class="fixed-column">
              <div class="instruction-cell">
                {{ stage }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- MIPS architecture diagram container -->
    <div class="architecture">
      <architectureComponent class="architecture" />
    </div>
  </div>
</template>

<script lang="ts">
/**
 * @component visualizationComponent
 * @description Visualization component for the MIPS pipeline simulation.
 * Displays the current state of the pipeline stages and the MIPS architecture diagram,
 * providing a visual representation of the instruction execution flow.
 */
import { defineComponent, onMounted, ref } from 'vue'
import { usePipelineStore } from 'src/stores/pipelineStore'
import architectureComponent from './architectureComponent.vue'

export default defineComponent({
  name: 'visualizationComponent',
  components: {
    architectureComponent,
  },
  setup() {
    const store = usePipelineStore()

    /**
     * Pipeline stage headers for display in the visualization table.
     * Represents the five stages of the MIPS pipeline.
     */
    const pipelineHeaders = ref(['FETCH', 'DECODE', 'EXECUTE', 'MEMORY', 'WRITEBACK'])

    /**
     * Initializes the pipeline store when component is mounted.
     * Ensures the pipeline state is properly initialized for visualization.
     */
    onMounted(() => {
      store.initialize()
    })

    // Expose reactive state and components to the template
    return {
      store,
      pipelineHeaders,
      architectureComponent,
    }
  },
})
</script>

<style scoped>
/**
 * Component-specific styles for the visualization display
 */

/* Main container with column layout and spacing */
.visualization-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 1rem;
  width: 100%;
}

/* Pipeline table container with overflow handling */
.pipeline-container {
  display: flex;
  flex-direction: column;
  overflow-x: auto;
}

/* Fixed-width table for consistent pipeline stage display */
.fixed-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

/* Column styling for pipeline stages */
.fixed-column {
  width: 20%;
  min-width: 120px;
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  overflow: hidden;
}

/* Instruction cell with text overflow handling */
.instruction-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Header styling with sticky positioning */
th {
  background-color: #f2f2f2;
  position: sticky;
  top: 0;
}

/* Architecture diagram container styling */
.architecture {
  width: 98%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 2rem;
}
</style>
