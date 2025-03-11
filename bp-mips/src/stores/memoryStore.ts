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
    readRegister(registerIndex: number): number {
      if (this.registers.length === 0) {
        this.resetRegisters()
      }

      if (registerIndex < 0 || registerIndex >= this.registers.length) {
        console.error(`Invalid register index: ${registerIndex}`)
        return 0
      }

      const register = this.registers[registerIndex]
      if (!register) {
        console.error(`Register at index ${registerIndex} is undefined`)
        return 0
      }

      return parseInt(register.value.replace(/\s/g, ''), 16) || 0
    },
    writeRegister(registerIndex: number, value: number): void {
      if (registerIndex === 0) {
        return
      }

      if (this.registers.length === 0) {
        this.resetRegisters()
      }

      if (registerIndex < 0 || registerIndex >= this.registers.length) {
        console.error(`Invalid register index: ${registerIndex}`)
        return
      }

      const register = this.registers[registerIndex]
      if (!register) {
        console.error(`Register at index ${registerIndex} is undefined`)
        return
      }
      const hexValue = value.toString(16).padStart(8, '0').toUpperCase()
      register.value = `${hexValue.substring(0, 4)} ${hexValue.substring(4)}`
    },
    readMemory(address: number): number {
      if (this.memoryArray.length === 0) {
        this.initialize()
      }
      const hexAddress = address.toString(16).padStart(4, '0').toUpperCase()

      const cell = this.memoryArray.find(cell => cell.address === hexAddress)

      if (!cell) {
        console.error(`Memory address not found: 0x${hexAddress}`)
        return 0
      }
      return parseInt(cell.value.replace(/\s/g, ''), 16) || 0
    },

    writeMemory(address: number, value: number): void {
      if (this.memoryArray.length === 0) {
        this.initialize()
      }
      const hexAddress = address.toString(16).padStart(4, '0').toUpperCase()
      const cell = this.memoryArray.find(cell => cell.address === hexAddress)

      if (!cell) {
        console.error(`Memory address not found: 0x${hexAddress}`)
        return
      }
      const hexValue = value.toString(16).padStart(8, '0').toUpperCase()
      cell.value = `${hexValue.substring(0, 4)} ${hexValue.substring(4)}`
    }
  },
})
