<template>
  <!-- Speed display badge showing current execution speed -->
  <q-badge color="secondary">
    Speed per instruction: {{ speed }} (10 to 1000 ms)
  </q-badge>
  <!-- Slider container for adjusting execution speed -->
  <div class="q-pa-md slider">
    <q-slider v-model="speed" :min="10" :max="1000" color="white" @update:model-value="updateExecutionSpeed"/>
  </div>
</template>

<script lang="ts">
/**
 * @component SpeedBar
 * @description Control component for adjusting the MIPS pipeline execution speed.
 * Provides a slider interface allowing users to set the execution delay between
 * instructions from 10ms (fastest) to 1000ms (slowest).
 */
import { defineComponent, ref, onMounted } from 'vue'
import { usePipelineStore } from 'src/stores/pipelineStore'

export default defineComponent({
  name: 'SpeedBar',
  setup() {
    const pipelineStore = usePipelineStore()
    /**
     * Reactive reference to the current execution speed.
     * Initially set to the value from the pipeline store.
     */
    const speed = ref(pipelineStore.executionSpeed)

    /**
     * Updates the execution speed in the pipeline store when the slider value changes.
     * @param value - The new speed value from the slider, in milliseconds
     */
    const updateExecutionSpeed = (value: number | null) => {
      if (value === null) {
        pipelineStore.setExecutionSpeed(0)
        return
      }
      pipelineStore.setExecutionSpeed(value)
    }

    /**
     * Sets the initial speed value from the store when the component is mounted.
     * Ensures the UI slider reflects the actual stored speed value.
     */
    onMounted(() => {
      speed.value = pipelineStore.executionSpeed
    })

    // Expose reactive state and methods to the template
    return {
      speed,
      updateExecutionSpeed
    }
  }
})
</script>

<style scoped>
/**
 * Component-specific styles for the speed control slider
 */

/* Slider container with specific width and alignment */
.slider {
  display: flex;
  justify-content: center;
  width: 30%;
  padding: 0px;
  padding-left: 12px;
}
</style>
