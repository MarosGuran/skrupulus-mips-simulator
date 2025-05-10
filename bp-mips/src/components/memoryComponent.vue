<template>
  <!-- Main container for memory and registers -->
  <div class="memory-container">
    <!-- Register operation buttons -->
    <div class="buttons-container">
      <!-- Reset registers to initial state -->
      <q-btn icon="refresh" @click="resetRegisters"></q-btn>
      <!-- Restore registers to last uploaded state -->
      <q-btn icon="refresh save" @click="refreshToLastUploadedState"></q-btn>
      <!-- Save registers to file -->
      <q-btn icon="save" @click="saveToFile"></q-btn>
      <!-- Upload registers from file -->
      <q-btn icon="upload" @click="triggerFileInput"></q-btn>
      <!-- Hidden file input for register upload -->
      <input type="file" @change="uploadFile" ref="registerFileInput" style="display: none;" />
    </div>
    <!-- Register values display area -->
    <div class="registers-container">
      <table>
        <tbody>
          <!-- Register row for each register in store -->
          <tr v-for="register in store.registers" :key="register.name">
            <td>{{ register.name }}</td>
            <td>
              <!-- Special handling for $0 register (read-only) -->
              <template v-if="register.name === '$0'">
                <input type="text" :value="register.value" disabled class="zero-register" />
              </template>
              <!-- Editable input for all other registers -->
              <template v-else>
                <input type="text"
                    v-model="register.value"
                    @input="cleanHexInput($event, register)"
                    @blur="formatRegisterHex(register)"
                    class="hex-input"
                  />
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Memory operation buttons -->
    <div class="buttons-container memory-buttons">
      <!-- Reset memory to initial state -->
      <q-btn icon="refresh" @click="resetMemory"></q-btn>
      <!-- Restore memory to last uploaded state -->
      <q-btn icon="refresh save" @click="refreshToLastUploadedStateMemory"></q-btn>
      <!-- Save memory to file -->
      <q-btn icon="save" @click="saveMemoryToFile"></q-btn>
      <!-- Upload memory from file -->
      <q-btn icon="upload" @click="triggerMemoryFileInput"></q-btn>
      <!-- Hidden file input for memory upload -->
      <input type="file" @change="uploadMemoryFile" ref="memoryFileInput" style="display: none;" />
    </div>
    <!-- Memory values display area -->
    <div class="data-container">
      <table>
        <tbody>
          <!-- Memory row for each address in displayed memory range -->
          <tr v-for="memory in memoryDisplay" :key="memory.address">
            <td>{{ memory.address }}</td>
            <td>
              <input type="text"
                v-model="memory.value"
                @input="cleanHexInput($event, memory)"
                @blur="formatMemoryHex(memory)"
                @change="updateMemoryValue(memory)"
                class="hex-input"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * @component memoryComponent
 * @description Component for displaying and editing MIPS registers and memory.
 * Provides an interface for viewing and modifying register values and memory contents,
 * with support for saving and loading states from files.
 */
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useMemoryStore } from 'src/stores/memoryStore'

export default defineComponent({
  name: 'memoryComponent',
  setup() {
    const store = useMemoryStore()
    // Separate file input refs for registers and memory
    const registerFileInput = ref<HTMLInputElement | null>(null)
    const memoryFileInput = ref<HTMLInputElement | null>(null)

    /**
     * Computed property that returns the current memory display.
     * Gets a subset of memory addresses and values for UI display.
     */
    const memoryDisplay = computed(() => {
      return store.getMemoryDisplay(0)
    })

    /**
     * Initializes the memory store when component is mounted.
     */
    onMounted(() => {
      store.initialize()
    })

    /**
     * Ensures input values are valid hexadecimal by removing invalid characters.
     * @param event - The input event
     * @param item - The register or memory item being modified
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanHexInput = (event: Event, item: any) => {
      const input = event.target as HTMLInputElement
      const cleaned = input.value.replace(/[^a-fA-F0-9\s]+/g, '').toUpperCase()
      if (input.value !== cleaned) {
        input.value = cleaned
        item.value = cleaned
      }
    }

    /**
     * Formats register values as 8-digit hexadecimal with space in the middle.
     * Ensures consistent display format for register values.
     * @param register - The register object to format
     */
    const formatRegisterHex = (register: { value: string }) => {
      let value = register.value.replace(/\s/g, '')
      value = value.padStart(8, '0')

      if (value.length > 8) {
        value = value.substring(value.length - 8)
      }
      register.value = `${value.substring(0, 4)} ${value.substring(4)}`
    }

    /**
     * Formats memory values as 8-digit hexadecimal with space in the middle.
     * Ensures consistent display format for memory values.
     * @param memory - The memory object to format
     */
    const formatMemoryHex = (memory: { value: string }) => {
      let value = memory.value.replace(/\s/g, '')
      value = value.padStart(8, '0')
      if (value.length > 8) {
        value = value.substring(value.length - 8)
      }
      memory.value = `${value.substring(0, 4)} ${value.substring(4)}`
    }

    /**
     * Updates the memory store when a memory value is changed in the UI.
     * Converts hexadecimal display value to binary for storage.
     * @param memory - The memory object containing address and new value
     */
    const updateMemoryValue = (memory: { address: string, value: string }) => {
      const addressInDecimal = parseInt(memory.address, 16)
      const valueAsNumber = parseInt(memory.value.replace(/\s/g, ''), 16)
      store.writeMemory(addressInDecimal, valueAsNumber)
    }

    /**
     * Saves register values to a text file for external storage.
     * Creates a downloadable file with each register and its value.
     */
    const saveToFile = () => {
      const content = store.registers
        .map(register => `${register.name}: ${register.value}`)
        .join('\n')
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'registers.txt'
      a.click()
      URL.revokeObjectURL(url)
    }

    /**
     * Loads register values from an uploaded text file.
     * Updates the registers and saves the state as the last uploaded state.
     * @param event - The file input change event
     */
    const uploadFile = (event: Event) => {
      const input = event.target as HTMLInputElement
      if (input.files && input.files[0]) {
        const file = input.files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          const lines = content.split('\n')
          lines.forEach((line, index) => {
            const [name, value] = line.split(': ')
            if (store.registers[index]) {
              store.registers[index].name = name || store.registers[index].name
              store.registers[index].value = value || '0000 0000'
            }
          })
          store.saveCurrentStateAsLastUploaded()
          // Clear the file input for future uploads
          input.value = ''
        }
        reader.readAsText(file)
      }
    }

    /**
     * Triggers the file input click for register file upload.
     */
    const triggerFileInput = () => {
      if (registerFileInput.value) {
        registerFileInput.value.click()
      }
    }

    /**
     * Resets all registers to their initial state.
     */
    const resetRegisters = () => {
      store.resetRegisters()
    }

    /**
     * Restores registers to their last uploaded state.
     */
    const refreshToLastUploadedState = () => {
      store.refreshToLastUploadedState()
    }

    /**
     * Resets all memory to its initial state (zeros).
     */
    const resetMemory = () => {
      store.resetMemory()
    }

    /**
     * Restores memory to its last uploaded state.
     */
    const refreshToLastUploadedStateMemory = () => {
      store.refreshToLastUploadedStateMemory()
    }

    /**
     * Saves non-zero memory values to a text file for external storage.
     * Creates a downloadable file with memory addresses and their values.
     */
    const saveMemoryToFile = () => {
      const hexWords = [];
      const totalWords = Math.floor(store.memory.length / 32);

      for (let i = 0; i < totalWords; i++) {
        const address = i * 4;
        const binaryValue = store.memory.substring(i * 32, (i + 1) * 32);
        const decimalValue = parseInt(binaryValue, 2);
        const hexValue = (decimalValue >>> 0).toString(16).padStart(8, '0').toUpperCase();

        if (decimalValue !== 0) {
          hexWords.push(`${address.toString(16).padStart(8, '0')}: ${hexValue}`);
        }
      }

      const content = hexWords.join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'memory_hex.txt';
      a.click();
      URL.revokeObjectURL(url);
    }

    /**
     * Loads memory values from an uploaded text file.
     * Updates the memory and saves the state as the last uploaded memory state.
     * @param event - The file input change event
     */
    const uploadMemoryFile = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const lines = content.split('\n');

          let newMemory = "0".repeat(1024 * 8);

          lines.forEach(line => {
            if (line.includes(':')) {
              const [addrStr, valueStr] = line.split(':').map(s => s.trim());
              const address = parseInt(addrStr as string, 16);
              const value = parseInt(valueStr as string, 16);

              const bitPosition = (address & ~0x3) * 8;

              const binaryValue = (value >>> 0).toString(2).padStart(32, '0');

              if (bitPosition + 31 < newMemory.length) {
                newMemory =
                  newMemory.substring(0, bitPosition) +
                  binaryValue +
                  newMemory.substring(bitPosition + 32);
              }
            }
          });

          store.memory = newMemory;
          store.saveCurrentStateAsLastUploadedMemory();
          // Clear the file input for future uploads
          input.value = '';
        };
        reader.readAsText(file);
      }
    }

    /**
     * Triggers the file input click for memory file upload.
     */
    const triggerMemoryFileInput = () => {
      if (memoryFileInput.value) {
        memoryFileInput.value.click()
      }
    }

    return {
      store,
      registerFileInput,
      memoryFileInput,
      memoryDisplay,
      updateMemoryValue,
      saveToFile,
      uploadFile,
      triggerFileInput,
      resetRegisters,
      refreshToLastUploadedState,
      cleanHexInput,
      formatRegisterHex,
      formatMemoryHex,
      resetMemory,
      refreshToLastUploadedStateMemory,
      saveMemoryToFile,
      uploadMemoryFile,
      triggerMemoryFileInput,
    }
  },
})
</script>

<style scoped>
/**
 * Component-specific styles for the memory and register display
 */

/* Main container with vertical layout */
.memory-container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  padding-bottom: 0rem;
}

/* Button container with horizontal layout */
.buttons-container {
  display: flex;
  height: 5vh;
  gap: 10px;
  margin-bottom: 10px;
}

/* Scrollable container for register display */
.registers-container {
  height: 40vh;
  overflow-y: auto;
}

/* Scrollable container for memory display */
.data-container {
  height: calc(35vh - 1rem);
  overflow-y: auto;
}

/* Table styling for consistent data presentation */
table {
  width: 100%;
  border-collapse: collapse;
}

/* Cell styling for both registers and memory */
th, td {
  border: 1px solid #ddd;
  padding: 2px;
  text-align: left;
}

/* Header styling for table */
th {
  background-color: #f2f2f2;
}

/* Input field styling */
input {
  width: 100%;
  box-sizing: border-box;
}

/* Memory button container positioning */
.memory-buttons {
  margin-top: 10px;
  margin-bottom: 10px;
}

</style>
