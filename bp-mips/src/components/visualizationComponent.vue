<template>
  <div class="visualization-container">
    <div class="pipeline-container">
      <table class="fixed-table">
        <thead>
          <tr>
            <th v-for="(header, i) in pipelineHeaders"
                :key="`header-${i}`"
                class="fixed-column">
              {{ header }}
            </th>
          </tr>
        </thead>
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
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { usePipelineStore } from 'src/stores/pipelineStore'

export default defineComponent({
  name: 'visualizationComponent',
  setup() {
    const store = usePipelineStore()
    const pipelineHeaders = ref(['FETCH', 'DECODE', 'EXECUTE', 'MEMORY', 'WRITEBACK'])

    onMounted(() => {
      store.initialize()
    })

    return {
      store,
      pipelineHeaders
    }
  },
})
</script>

<style scoped>
.visualization-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 1rem;
  width: 100%;
}

.pipeline-container {
  display: flex;
  flex-direction: column;
  overflow-x: auto; /* Allows horizontal scrolling if needed */
}

.fixed-table {
  width: 100%;
  table-layout: fixed; /* Critical for fixed column widths */
  border-collapse: collapse;
}

.fixed-column {
  width: 20%; /* Each column gets equal width (5 columns) */
  min-width: 120px; /* Minimum width to prevent columns from getting too small */
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  overflow: hidden; /* Hide overflow content */
}

.instruction-cell {
  white-space: nowrap; /* Prevent text wrapping */
  overflow: hidden; /* Hide overflowing text */
  text-overflow: ellipsis; /* Add ellipsis (...) for overflow */
  max-width: 100%;
}

th {
  background-color: #f2f2f2;
  position: sticky; /* Optional: Makes headers stick when scrolling */
  top: 0;
}

/* Add hover effect to see full content */
.instruction-cell:hover {
  white-space: normal; /* Allow wrapping on hover */
  overflow: visible; /* Show all content on hover */
  position: relative;
  z-index: 10;
  background-color: #f9f9f9;
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
  padding: 2px 4px;
  border-radius: 2px;
}
</style>
