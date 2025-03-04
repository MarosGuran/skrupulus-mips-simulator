import { defineStore } from 'pinia'

export interface Register {
  name: string
  value: string
}

export interface MemoryCell {
  address: string
  value: string
}

export const useMemoryStore = defineStore('memoryStore', {
  state: () => ({
    registers: [] as Register[],
    memoryArray: [] as MemoryCell[],
    lastUploadedState: [] as Register[],
  }),
  actions: {
    initialize() {
      this.registers = Array.from({ length: 32 }, (_, i) => ({
        name: `$${i}`,
        value: '0000 0000',
      }))
      this.memoryArray = Array.from({ length: 256 }, (_, i) => ({
        address: `${(i * 4).toString(16).padStart(4, '0').toUpperCase()}`,
        value: '0000 0000',
      }))

      this.saveCurrentStateAsLastUploaded()
    },
    resetRegisters() {
      this.registers = Array.from({ length: 32 }, (_, i) => ({
        name: `$${i}`,
        value: '0000 0000',
      }))
    },
    refreshToLastUploadedState() {
      this.registers = this.lastUploadedState.map(reg => ({
        name: reg.name,
        value: reg.value
      }))
    },
    saveCurrentStateAsLastUploaded() {
      this.lastUploadedState = this.registers.map(reg => ({
        name: reg.name,
        value: reg.value
      }))
    },
  },
})
