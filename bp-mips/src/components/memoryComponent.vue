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
              <input type="text" v-model="register.value" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="data-container">
      <table>
        <tbody>
          <tr v-for="memory in store.memoryArray" :key="memory.address">
            <td>{{ memory.address }}</td>
            <td>
              <input type="text" v-model="memory.value" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useMemoryStore } from 'src/stores/memoryStore'

export default defineComponent({
  name: 'memoryComponent',
  setup() {
    const store = useMemoryStore()
    const fileInput = ref<HTMLInputElement | null>(null)

    onMounted(() => {
      store.initialize()
    })

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
      saveToFile,
      uploadFile,
      triggerFileInput,
      resetRegisters,
      refreshToLastUploadedState,
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
