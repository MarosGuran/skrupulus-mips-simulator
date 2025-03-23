import { defineStore } from 'pinia'

export interface CodeLine {
  address: string
  instruction: string
}

export const useCodeStore = defineStore('codeStore', {
  state: () => ({
    codeArray: [] as CodeLine[],
  }),
  actions: {
    initialize() {
      this.codeArray = []
    },

    updateCode(codeLines: string[]) {
      this.codeArray = codeLines.map((line, index) => ({
        address: `${(index).toString(16).padStart(4, '0').toUpperCase()}`,
        instruction: line.trim().toUpperCase(),
      }))
    },

    clearCode() {
      this.codeArray = []
    }
  },
})
