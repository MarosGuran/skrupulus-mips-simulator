/**
 * @store memoryStore
 * @description State management for MIPS registers and memory.
 * Provides functionality for reading, writing, and manipulating registers
 * and memory locations, as well as saving and restoring system state.
 */
import { defineStore } from 'pinia'

/**
 * Interface defining the structure of a MIPS register.
 * Each register has a name (e.g., "$0", "$1") and a hexadecimal value.
 */
export interface Register {
  name: string
  value: string
}

/**
 * Store for managing MIPS registers and memory state.
 * Provides actions for initializing, reading, writing, and manipulating registers and memory.
 */
export const useMemoryStore = defineStore('memoryStore', {
  /**
   * State containing registers, memory, and backup states.
   */
  state: () => ({
    registers: [] as Register[],
    memory: "0".repeat(1024 * 8),

    lastUploadedState: [] as Register[],
    lastUploadedMemory: "",
  }),

  /**
   * Actions for manipulating registers and memory.
   */
  actions: {
    /**
     * Initializes the memory store with default values.
     * Creates 32 registers with zero values and initializes memory to all zeros.
     */
    initialize() {
      this.registers = Array.from({ length: 32 }, (_, i) => ({
        name: `$${i}`,
        value: '0000 0000',
      }))

      this.memory = "0".repeat(1024 * 8)

      this.saveCurrentStateAsLastUploaded()
      this.saveCurrentStateAsLastUploadedMemory()
    },

    /**
     * Resets all registers to their initial zero values.
     */
    resetRegisters() {
      this.registers = Array.from({ length: 32 }, (_, i) => ({
        name: `$${i}`,
        value: '0000 0000',
      }))
    },

    /**
     * Resets memory to all zeros.
     */
    resetMemory(): void {
      this.memory = "0".repeat(1024 * 8);
    },

    /**
     * Restores registers to their last uploaded state.
     * Ensures register $0 remains zero regardless of uploaded state.
     */
    refreshToLastUploadedState() {
      this.registers = this.lastUploadedState.map(reg => ({
        name: reg.name,
        value: reg.value
      }))
      this.registers[0]!.value = '0000 0000'
    },

    /**
     * Restores memory to its last uploaded state.
     * Displays a warning if no previous upload exists.
     */
    refreshToLastUploadedStateMemory(): void {
      if (this.lastUploadedMemory) {
        this.memory = this.lastUploadedMemory;
      } else {
        console.warn('No previously uploaded memory state available');
      }
    },

    /**
     * Saves the current register state as the last uploaded state.
     * Used for creating restore points after file uploads.
     */
    saveCurrentStateAsLastUploaded() {
      this.lastUploadedState = this.registers.map(reg => ({
        name: reg.name,
        value: reg.value
      }))
      this.registers[0]!.value = '0000 0000'
    },

    /**
     * Saves the current memory state as the last uploaded state.
     * Used for creating restore points after file uploads.
     */
    saveCurrentStateAsLastUploadedMemory(): void {
      this.lastUploadedMemory = this.memory;
    },

    /**
     * Reads a value from a specific register.
     * Converts the hexadecimal string value to a number.
     * @param registerIndex - Index of the register to read (0-31)
     * @returns The value of the register as a number
     */
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

    /**
     * Writes a value to a specific register.
     * Converts the number to a formatted hexadecimal string.
     * Prevents writing to register $0, which must always remain zero.
     * @param registerIndex - Index of the register to write (0-31)
     * @param value - The number value to write to the register
     */
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
      const hexValue = (value >>> 0).toString(16).padStart(8, '0').toUpperCase()
      register.value = `${hexValue.substring(0, 4)} ${hexValue.substring(4)}`
    },

    /**
     * Reads a word (4 bytes) from memory at the specified address.
     * Handles address bounds checking and alignment issues.
     * @param address - The memory address to read from
     * @returns The value at the memory address, or undefined if error
     */
    readMemory(address: number): number | undefined {
      const byteAddress = address;

      const memoryLengthInBytes = this.memory.length / 8;

      if (byteAddress < 0) {
        const errorMessage = `Error: Negative memory address ${byteAddress.toString(16).toUpperCase()} is invalid`;
        console.error(errorMessage);
        alert(errorMessage);
        return;
      }
      if (byteAddress >= memoryLengthInBytes) {
        const errorMessage = `Error: Memory address ${byteAddress.toString(16).toUpperCase()} is out of bounds. Maximum address is ${(memoryLengthInBytes - 1).toString(16).toUpperCase()}`;
        console.error(errorMessage);
        alert(errorMessage);
        return;
      } else if (byteAddress + 4 > memoryLengthInBytes) {
        const errorMessage = `Error: Word operation at address ${byteAddress.toString(16).toUpperCase()} would exceed memory bounds`;
        console.error(errorMessage);
        alert(errorMessage);
        return;
      }

      const startWordAddr = byteAddress & ~0x3;
      const endWordAddr = (byteAddress + 3) & ~0x3;

      const startBitAddr = startWordAddr * 8;
      const endBitAddr = endWordAddr * 8;

      const byteOffset = byteAddress & 0x3;

      if (startWordAddr === endWordAddr) {
        const wordBitAddr = startBitAddr;

        if (wordBitAddr + 31 >= this.memory.length) {
          console.error(`Memory address out of bounds: ${address}`);
          return 0;
        }

        const binaryValue = this.memory.substring(wordBitAddr, wordBitAddr + 32);
        const wordValue = parseInt(binaryValue, 2);

        if (byteOffset === 0) {
          return wordValue;
        }

        return (wordValue >> (byteOffset * 8)) & 0xFF;
      } else {
        const firstWordBitAddr = startBitAddr;
        const secondWordBitAddr = endBitAddr;

        let firstWord = 0;
        if (firstWordBitAddr + 31 < this.memory.length) {
          const binaryValue = this.memory.substring(firstWordBitAddr, firstWordBitAddr + 32);
          firstWord = parseInt(binaryValue, 2);
        }

        let secondWord = 0;
        if (secondWordBitAddr + 31 < this.memory.length) {
          const binaryValue = this.memory.substring(secondWordBitAddr, secondWordBitAddr + 32);
          secondWord = parseInt(binaryValue, 2);
        }

        const bytesFromFirst = 4 - byteOffset;

        const upperPart = firstWord >>> (byteOffset * 8);
        const lowerPart = secondWord & ((1 << ((4 - bytesFromFirst) * 8)) - 1);

        return upperPart | (lowerPart << (bytesFromFirst * 8));
      }
    },

    /**
     * Writes a word (4 bytes) to memory at the specified address.
     * Handles address bounds checking, alignment issues, and bit manipulations.
     * @param address - The memory address to write to
     * @param value - The value to write to memory
     */
    writeMemory(address: number, value: number): void {
      const byteAddress = address;
      console.log(`Writing ${value.toString(16)} to address ${byteAddress.toString(16).toUpperCase()}`);
      const memoryLengthInBytes = this.memory.length / 8;


      if (byteAddress < 0) {
        const errorMessage = `Error: Negative memory address ${byteAddress.toString(16).toUpperCase()} is invalid`;
        console.error(errorMessage);
        alert(errorMessage);
        return;
      }
      if (byteAddress >= memoryLengthInBytes) {
        const errorMessage = `Error: Memory address ${byteAddress.toString(16).toUpperCase()} is out of bounds. Maximum address is ${(memoryLengthInBytes - 1).toString(16).toUpperCase()}`;
        console.error(errorMessage);
        alert(errorMessage);
        return;
      } else if (byteAddress + 4 > memoryLengthInBytes) {
        const errorMessage = `Error: Word operation at address ${byteAddress.toString(16).toUpperCase()} would exceed memory bounds`;
        console.error(errorMessage);
        alert(errorMessage);
        return;
      }

      const startWordAddr = byteAddress & ~0x3;
      const endWordAddr = (byteAddress + 3) & ~0x3;

      const startBitAddr = startWordAddr * 8;
      const endBitAddr = endWordAddr * 8;

      const byteOffset = byteAddress & 0x3;

      console.log(`Writing ${value.toString(16)} to address ${byteAddress}, offset ${byteOffset}`);

      if (startWordAddr === endWordAddr) {
        const wordBitAddr = startBitAddr;

        let currentWord = 0;
        if (wordBitAddr < this.memory.length) {
          const binaryValue = this.memory.substring(wordBitAddr, wordBitAddr + 32);
          currentWord = parseInt(binaryValue, 2);
        }


        if (byteOffset === 0 && byteAddress % 4 === 0) {
          const newValue = value;
          if (wordBitAddr + 31 < this.memory.length) {
            const binaryValue = (newValue >>> 0).toString(2).padStart(32, '0');
            const before = this.memory.substring(0, wordBitAddr);
            const after = this.memory.substring(wordBitAddr + 32);
            this.memory = before + binaryValue + after;
          }
        } else {
          const byteMask = 0xFF << (byteOffset * 8);
          const shiftedValue = (value & 0xFF) << (byteOffset * 8);

          const newValue = (currentWord & ~byteMask) | shiftedValue;

          if (wordBitAddr + 31 < this.memory.length) {
            const binaryValue = (newValue >>> 0).toString(2).padStart(32, '0');
            const before = this.memory.substring(0, wordBitAddr);
            const after = this.memory.substring(wordBitAddr + 32);
            this.memory = before + binaryValue + after;
          }
        }
      } else {
        const firstWordBitAddr = startBitAddr;
        let firstWord = 0;
        if (firstWordBitAddr < this.memory.length) {
          const binaryValue = this.memory.substring(firstWordBitAddr, firstWordBitAddr + 32);
          firstWord = parseInt(binaryValue, 2);
        }

        const bytesToKeep = byteOffset;
        const bytesToReplace = 4 - bytesToKeep;

        const keepMask = (1 << (bytesToKeep * 8)) - 1;

        const valueForFirstWord = value << (bytesToKeep * 8);

        const newFirstWord = (firstWord & keepMask) | (valueForFirstWord & ~keepMask);

        if (firstWordBitAddr + 31 < this.memory.length) {
          const binaryValue = (newFirstWord >>> 0).toString(2).padStart(32, '0');
          const before = this.memory.substring(0, firstWordBitAddr);
          const after = this.memory.substring(firstWordBitAddr + 32);
          this.memory = before + binaryValue + after;
        }

        const secondWordBitAddr = endBitAddr;
        let secondWord = 0;
        if (secondWordBitAddr < this.memory.length) {
          const binaryValue = this.memory.substring(secondWordBitAddr, secondWordBitAddr + 32);
          secondWord = parseInt(binaryValue, 2);
        }

        const bytesForSecondWord = value >>> (bytesToReplace * 8);


        const lowerMask = (1 << (bytesToKeep * 8)) - 1;


        const newSecondWord = (secondWord & ~lowerMask) | (bytesForSecondWord & lowerMask);

        if (secondWordBitAddr + 31 < this.memory.length) {
          const binaryValue = (newSecondWord >>> 0).toString(2).padStart(32, '0');
          const before = this.memory.substring(0, secondWordBitAddr);
          const after = this.memory.substring(secondWordBitAddr + 32);
          this.memory = before + binaryValue + after;
        }
      }
    },

    /**
     * Generates a display-friendly representation of memory for the UI.
     * Creates an array of address-value pairs with formatted hexadecimal values.
     * @param startAddress - The starting memory address to display from
     * @returns Array of objects with memory addresses and their formatted values
     */
    getMemoryDisplay(startAddress: number = 0): { address: string, value: string }[] {
      const result = [];

      const totalWords = Math.floor(this.memory.length / 32);

      const startWord = Math.floor(startAddress / 32);

      for (let i = 0; i < totalWords; i++) {
        const address = (startWord + i) * 32;

        if (address + 31 >= this.memory.length) break;

        const binaryValue = this.memory.substring(address, address + 32);
        const decimalValue = parseInt(binaryValue, 2);
        const hexValue = (decimalValue >>> 0).toString(16).padStart(8, '0').toUpperCase();

        result.push({
          address: (address / 8).toString(16).padStart(4, '0').toUpperCase(),
          value: `${hexValue.substring(0, 4)} ${hexValue.substring(4)}`
        });
      }

      return result;
    }
  },
})
