import { defineStore } from 'pinia'
import { resetMipsPipeline } from 'src/utils/mips'
import { resetMipsProgramCounter } from 'src/utils/mips'

export const usePipelineStore = defineStore('pipelineStore', {
  state: () => ({
    stages: ['NOP', 'NOP', 'NOP', 'NOP', 'NOP'] as string[],
    isRunning: false,
    executionSpeed: 0,
    pc: 0,
  }),
  actions: {
    initialize() {
      this.stages = ['NOP', 'NOP', 'NOP', 'NOP', 'NOP']
    },
    startExecution() {
      this.isRunning = true;
    },
    updatePC(pc: number) {
      this.pc = pc;
    },
    stopExecution() {
      this.isRunning = false;
      resetMipsPipeline();
      resetMipsProgramCounter();
    },
    resetStages() {
      this.stages = ['NOP', 'NOP', 'NOP', 'NOP', 'NOP']
    },
    updateStage(stageIndex: number, instruction: string) {
      this.stages[stageIndex] = instruction
    },
    pushInstruction(instruction: string) {
      const removed = this.stages.pop()
      this.stages.unshift(instruction)
      return removed
    },
    setExecutionSpeed(speed: number) {
      this.executionSpeed = speed;
    },
  },
})
