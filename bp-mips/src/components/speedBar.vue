<template>
  <q-badge color="secondary">
    Speed per instruction: {{ speed }} (0 to 1000 ms)
  </q-badge>
  <div class="q-pa-md slider">
    <q-slider v-model="speed" :min="0" :max="1000" color="white" @update:model-value="updateExecutionSpeed"/>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { usePipelineStore } from 'src/stores/pipelineStore'

export default defineComponent({
  name: 'SpeedBar',
  setup() {
    const pipelineStore = usePipelineStore()
    const speed = ref(pipelineStore.executionSpeed)


    const updateExecutionSpeed = (value: number | null) => {
      if (value === null) {
        pipelineStore.setExecutionSpeed(0)
        return
      }
      pipelineStore.setExecutionSpeed(value)
    }

    onMounted(() => {
      speed.value = pipelineStore.executionSpeed
    })

    return {
      speed,
      updateExecutionSpeed
    }
  }
})
</script>

<style scoped>
.slider {
  display: flex;
  justify-content: center;
  width: 30%;
  padding: 0px;
  padding-left: 12px;
}
</style>
