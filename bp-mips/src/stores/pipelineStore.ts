/**
 * @store pipelineStore
 * @description State management for the MIPS pipeline simulation.
 * Handles tracking of instructions through the pipeline stages,
 * visual representation through colors, and execution control.
 */
import { defineStore } from 'pinia'
import { resetMipsPipeline, resetMipsProgramCounter } from 'src/utils/mips'

/**
 * Store for managing MIPS pipeline state.
 * Provides actions for tracking instruction flow through the pipeline
 * and controlling execution parameters.
 */
export const usePipelineStore = defineStore('pipelineStore', {
  /**
   * State containing pipeline stages, visual representation data, and execution controls.
   */
  state: () => ({
    stages: ['NOP', 'NOP', 'NOP', 'NOP', 'NOP'] as string[],
    colorOptions: ['blue', 'green', 'red', 'orange', 'purple', 'brown'],
    instructionColors: new Map<string, string>(),
    stageColors: ['gray', 'gray', 'gray', 'gray', 'gray'] as string[],
    colorIndex: 0,
    isRunning: false,
    executionSpeed: 10,
    pc: 0,
  }),

  actions: {
    /**
     * Initializes the pipeline store to its default state.
     * Resets all pipeline stages to NOP and clears instruction color mappings.
     */
    initialize() {
      this.stages = ['NOP', 'NOP', 'NOP', 'NOP', 'NOP'];
      this.stageColors = ['gray', 'gray', 'gray', 'gray', 'gray'];
      this.instructionColors.clear();
      this.colorIndex = 0;
    },

    /**
     * Sets the execution state to running.
     * Called when pipeline simulation begins.
     */
    startExecution() {
      this.isRunning = true;
    },

    /**
     * Updates the program counter value.
     * @param pc - The new program counter value
     */
    updatePC(pc: number) {
      this.pc = pc;
    },

    /**
     * Stops the pipeline execution and resets the simulation state.
     * Resets the MIPS pipeline, program counter, and pipeline visualization.
     */
    stopExecution() {
      this.isRunning = false;
      resetMipsPipeline();
      resetMipsProgramCounter();
      this.initialize();
    },

    /**
     * Resets all pipeline stages to NOP.
     * Clears instruction color assignments and resets stage colors.
     */
    resetStages() {
      this.stages = ['NOP', 'NOP', 'NOP', 'NOP', 'NOP'];
      this.stageColors = ['gray', 'gray', 'gray', 'gray', 'gray'];
      this.instructionColors.clear();
      this.colorIndex = 0;
    },

    /**
     * Updates a specific pipeline stage with a new instruction.
     * Handles color assignment for visual tracking of instructions.
     * @param stageIndex - The index of the stage to update (0-4)
     * @param instruction - The instruction to place in the stage
     */
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

    /**
     * Pushes a new instruction into the pipeline at the fetch stage.
     * Shifts all existing instructions forward and removes the instruction
     * that exits the writeback stage.
     * @param instruction - The new instruction entering the pipeline
     * @returns The instruction that was removed from the writeback stage
     */
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

    /**
     * Gets the color assigned to a specific pipeline stage.
     * @param index - The index of the pipeline stage (0-4)
     * @returns The color string for the stage
     */
    getStageColor(index: number): string {
      return this.stageColors[index] || '';
    },

    /**
     * Gets the CSS fill style for a pipeline stage in the visualization.
     * @param index - The index of the pipeline stage (0-4)
     * @returns CSS fill style string
     */
    getStageFillStyle(index: number): string {
      const color = this.stageColors[index];
      return color ? `fill:${color};` : '';
    },

    /**
     * Gets the CSS stroke style for a pipeline stage in the visualization.
     * @param index - The index of the pipeline stage (0-4)
     * @returns CSS stroke style string
     */
    getStageStrokeStyle(index: number): string {
      const color = this.stageColors[index];
      return color ? `stroke:${color};stroke-width:2;` : '';
    },

    /**
     * Sets the execution speed for the pipeline simulation.
     * @param speed - Delay in milliseconds between pipeline cycles
     */
    setExecutionSpeed(speed: number) {
      this.executionSpeed = speed;
    },
  },
})
