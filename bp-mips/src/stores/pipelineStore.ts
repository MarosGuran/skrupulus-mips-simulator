import { defineStore } from 'pinia'
import { resetMipsPipeline, resetMipsProgramCounter } from 'src/utils/mips'

export const usePipelineStore = defineStore('pipelineStore', {
  state: () => ({
    stages: ['NOP', 'NOP', 'NOP', 'NOP', 'NOP'] as string[],
    colorOptions: ['blue', 'green', 'red', 'orange', 'purple', 'brown'],
    instructionColors: new Map<string, string>(),
    stageColors: ['gray', 'gray', 'gray', 'gray', 'gray'] as string[],
    colorIndex: 0,
    isRunning: false,
    executionSpeed: 0,
    pc: 0,
  }),

  actions: {
    initialize() {
      this.stages = ['NOP', 'NOP', 'NOP', 'NOP', 'NOP'];
      this.stageColors = ['gray', 'gray', 'gray', 'gray', 'gray'];
      this.instructionColors.clear();
      this.colorIndex = 0;
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
      this.initialize();
    },

    resetStages() {
      this.stages = ['NOP', 'NOP', 'NOP', 'NOP', 'NOP'];
      this.stageColors = ['gray', 'gray', 'gray', 'gray', 'gray'];
      this.instructionColors.clear();
      this.colorIndex = 0;
    },

    updateStage(stageIndex: number, instruction: string) {
      this.stages[stageIndex] = instruction;

      if (instruction === 'NOP') {
        this.stageColors[stageIndex] = '';
      } else {
        if (instruction !== 'NOP') {
          const color = this.colorOptions[this.colorIndex % this.colorOptions.length];
          this.instructionColors.set(instruction, color as string);
          this.colorIndex++;
        }

        // if (this.instructionColors.has(instruction)) {
        //   this.stageColors[stageIndex] = this.instructionColors.get(instruction) || '';
        // }
      }
    },

    pushInstruction(instruction: string) {
      const removed = this.stages.pop();

      this.stages.unshift(instruction);

      this.stageColors.pop();

      if (instruction !== 'NOP') {
        const color = this.colorOptions[this.colorIndex % this.colorOptions.length];
        this.instructionColors.set(instruction, color as string);
        this.colorIndex++;
        this.stageColors.unshift(color as string);
      } else if (instruction === 'NOP') {
        this.stageColors.unshift('');
      } else {
        this.stageColors.unshift(this.instructionColors.get(instruction) || '');
      }

      return removed;
    },

    getStageColor(index: number): string {
      return this.stageColors[index] || '';
    },

    getStageFillStyle(index: number): string {
      const color = this.stageColors[index];
      return color ? `fill:${color};` : '';
    },

    getStageStrokeStyle(index: number): string {
      const color = this.stageColors[index];
      return color ? `stroke:${color};stroke-width:2;` : '';
    },

    setExecutionSpeed(speed: number) {
      this.executionSpeed = speed;
    },
  },
})
