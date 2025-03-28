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
      pipelineHeaders,
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
  overflow-x: auto;
}

.fixed-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.fixed-column {
  width: 20%;
  min-width: 120px;
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  overflow: hidden;
}

.instruction-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

th {
  background-color: #f2f2f2;
  position: sticky;
  top: 0;
}
</style>
