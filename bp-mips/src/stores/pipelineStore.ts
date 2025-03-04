import { defineStore } from 'pinia'

export const usePipelineStore = defineStore('pipelineStore', {
  state: () => ({
    stages: ['NOP', 'NOP', 'NOP', 'NOP', 'NOP'] as string[],
  }),
  actions: {
    initialize() {
      this.stages = ['NOP', 'NOP', 'NOP', 'NOP', 'NOP']
    },
    resetStages() {
      this.stages = ['NOP', 'NOP', 'NOP', 'NOP', 'NOP']
    },
    updateStage(stageIndex: number, instruction: string) {
      this.stages[stageIndex] = instruction
    },
  },
})
