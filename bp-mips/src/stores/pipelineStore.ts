import { defineStore } from 'pinia'

export const usePipelineStore = defineStore('pipelineStore', {
  state: () => ({
    stages: ['NOP', 'NOP', 'NOP', 'NOP', 'NOP'] as string[],
    isRunning: false,
    executionSpeed: 0,
  }),
  actions: {
    initialize() {
      this.stages = ['NOP', 'NOP', 'NOP', 'NOP', 'NOP']
    },
    startExecution() {
      this.isRunning = true;
    },

    stopExecution() {
      this.isRunning = false;
    },
    resetStages() {
      this.stages = ['NOP', 'NOP', 'NOP', 'NOP', 'NOP']
    },
    updateStage(stageIndex: number, instruction: string) {
      this.stages[stageIndex] = instruction
    },
    setExecutionSpeed(speed: number) {
      this.executionSpeed = speed;
    },
  },
})
