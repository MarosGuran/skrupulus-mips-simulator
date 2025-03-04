<template>
  <div class="visualization-container">
    <div class="pipeline-container">
      <table>
        <thead>
          <tr>
            <th>FETCH</th>
            <th>DECODE</th>
            <th>EXECUTE</th>
            <th>MEMORY</th>
            <th>WRITEBACK</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-for="stage in store.stages" :key="stage">{{ stage }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="visualization-container">
      <!-- Visualization content will go here -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { usePipelineStore } from 'src/stores/pipelineStore'

export default defineComponent({
  name: 'visualizationComponent',
  setup() {
    const store = usePipelineStore()

    onMounted(() => {
      store.initialize()
    })

    return {
      store,
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
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

th {
  background-color: #f2f2f2;
}
</style>
