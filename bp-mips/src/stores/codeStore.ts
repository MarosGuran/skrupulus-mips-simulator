/**
 * @store codeStore
 * @description State management for MIPS assembly code.
 * Handles the parsing, storage, and manipulation of assembly code lines,
 * maintaining their addresses and instructions for the simulator.
 */
import { defineStore } from 'pinia'

/**
 * Interface defining the structure of a code line in the MIPS assembly code.
 * Each line contains a hexadecimal address and the corresponding instruction.
 */
export interface CodeLine {
  address: string
  instruction: string
}

/**
 * Store for managing MIPS assembly code.
 * Provides actions for initializing, updating, and clearing code.
 */
export const useCodeStore = defineStore('codeStore', {
  /**
   * State containing the parsed assembly code lines.
   * Each line is stored as a CodeLine object with address and instruction.
   */
  state: () => ({
    codeArray: [] as CodeLine[],
  }),

  /**
   * Actions for manipulating the code store state.
   */
  actions: {
    /**
     * Initializes the code store with an empty array.
     * Called when the application or code editor is first loaded.
     */
    initialize() {
      this.codeArray = []
    },

    /**
     * Updates the code store with new code lines from the editor.
     * Parses each line, removes comments, and assigns memory addresses.
     * @param codeLines - Array of code lines from the editor
     */
    updateCode(codeLines: string[]) {
      this.codeArray = codeLines.map((line, index) => ({
        // Convert line index to hexadecimal address format (e.g., "0000", "0004")
        address: `${(index).toString(16).padStart(4, '0').toUpperCase()}`,
        // Extract instruction part (before any comments) and normalize formatting
        instruction: (line.split('#')[0] || '').trim().toUpperCase(),
      }))
    },

    /**
     * Clears all code from the store.
     * Resets the code array to empty.
     */
    clearCode() {
      this.codeArray = []
    }
  },
})
