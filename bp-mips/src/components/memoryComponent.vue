<template>
  <div class="memory-container">
    <div class="buttons-container">
      <q-btn icon="refresh" @click="resetRegisters"></q-btn>
      <q-btn icon="refresh save" @click="refreshToLastUploadedState"></q-btn>
      <q-btn icon="save" @click="saveToFile"></q-btn>
      <q-btn icon="upload" @click="triggerFileInput"></q-btn>
      <input type="file" @change="uploadFile" ref="fileInput" style="display: none;" />
    </div>
    <div class="registers-container">
      <table>
        <tbody>
          <tr v-for="register in store.registers" :key="register.name">
            <td>{{ register.name }}</td>
            <td>
              <template v-if="register.name === '$0'">
                <input type="text" :value="register.value" disabled class="zero-register" />
              </template>
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
        <div class="data-container">
      <table>
        <tbody>
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
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useMemoryStore } from 'src/stores/memoryStore'

export default defineComponent({
  name: 'memoryComponent',
  setup() {
    const store = useMemoryStore()
    const fileInput = ref<HTMLInputElement | null>(null)

    const memoryDisplay = computed(() => {
      return store.getMemoryDisplay(0)
    })

    onMounted(() => {
      store.initialize()
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanHexInput = (event: Event, item: any) => {
      const input = event.target as HTMLInputElement
      const cleaned = input.value.replace(/[^a-fA-F0-9\s]+/g, '').toUpperCase()
      if (input.value !== cleaned) {
        input.value = cleaned
        item.value = cleaned
      }
    }

    const formatRegisterHex = (register: { value: string }) => {
      let value = register.value.replace(/\s/g, '')
      value = value.padStart(8, '0')

      if (value.length > 8) {
        value = value.substring(value.length - 8)
      }
      register.value = `${value.substring(0, 4)} ${value.substring(4)}`
    }

    const formatMemoryHex = (memory: { value: string }) => {
      let value = memory.value.replace(/\s/g, '')
      value = value.padStart(8, '0')
      if (value.length > 8) {
        value = value.substring(value.length - 8)
      }
      memory.value = `${value.substring(0, 4)} ${value.substring(4)}`
    }


    const updateMemoryValue = (memory: { address: string, value: string }) => {
      const addressInDecimal = parseInt(memory.address, 16)

      const valueAsNumber = parseInt(memory.value.replace(/\s/g, ''), 16)

      store.writeMemory(addressInDecimal, valueAsNumber)
    }

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
        }
        reader.readAsText(file)
      }
    }

    const triggerFileInput = () => {
      fileInput.value?.click()
    }

    const resetRegisters = () => {
      store.resetRegisters()
    }

    const refreshToLastUploadedState = () => {
      store.refreshToLastUploadedState()
    }

    return {
      store,
      fileInput,
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
    }
  },
})
</script>

<style scoped>
.memory-container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  padding-bottom: 0rem;
}
.buttons-container {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.registers-container {
  height: 40vh;
  overflow-y: auto;
}
.data-container {
  margin-top: 1rem;
  height: calc(40vh - 1rem);
  overflow-y: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 2px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
input {
  width: 100%;
  box-sizing: border-box;
}

</style>
