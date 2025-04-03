<template>
  <div class="codemirror" style="width: 350px">
    <div class="buttons-container">
      <q-btn icon="play_arrow" @click="playsingle" :disable="pipelineStore.isRunning"></q-btn>
      <q-btn icon="fast_forward" @click="playwhole" :disable="pipelineStore.isRunning"></q-btn>
      <q-btn icon="stop" @click="stop"></q-btn>
      <q-btn icon="save" @click="saveToFile"></q-btn>
      <q-btn icon="upload" @click="triggerFileInput"></q-btn>
      <input type="file" @change="uploadFile" ref="fileInput" style="display: none;" />
    </div>
    <textarea id="editorContainer"></textarea>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useCodeStore } from 'src/stores/codeStore'
import { usePipelineStore } from 'src/stores/pipelineStore'

import { debugMipsPipeline, runMipsPipeline } from 'src/utils/mips'


import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/base16-light.css'

export default defineComponent({
  name: 'CodeMirrorEditor',
  setup() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let editor: any
    const fileInput = ref<HTMLInputElement | null>(null)
    let currentHighlightedLine: number | null = null
    const codeStore = useCodeStore()
    const pipelineStore = usePipelineStore()

    onMounted(() => {
      const textarea = document.getElementById('editorContainer') as HTMLTextAreaElement
      if (textarea) {
        editor = CodeMirror.fromTextArea(textarea, {
          lineNumbers: true,
          theme: 'base16-light',
          lineNumberFormatter: (line: number) => {
            return (line - 1).toString(16).toUpperCase().padStart(4, '0')
          },
        })

        editor.on('change', () => {
          updateCodeStore()
        })
      }

      codeStore.initialize()
    })


    const updateCodeStore = () => {
      if (!editor) return

      const content = editor.getValue()
      const lines = content.split('\n')

      codeStore.updateCode(lines)
    }

    const playsingle = () => {
      updateCodeStore()
      const lineNumber = debugMipsPipeline()

      if (lineNumber >= 0) {
        highlightLine(lineNumber)
      }
    }

    const playwhole = () => {
      updateCodeStore()
      if (currentHighlightedLine !== null) {
        removeHighlight(currentHighlightedLine)
      }
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      runMipsPipeline()
    }

    const stop = () => {
      console.log('Stop button clicked')
      pipelineStore.stopExecution()
      if (currentHighlightedLine !== null) {
        removeHighlight(currentHighlightedLine)
      }
    }

    const highlightLine = (lineNumber: number) => {
      if (editor) {
        if (currentHighlightedLine !== null) {
          editor.removeLineClass(currentHighlightedLine, 'background', 'highlight-line')
        }
        console.log(`Highlighting line: ${lineNumber}`)
        editor.addLineClass(lineNumber, 'background', 'highlight-line')
        currentHighlightedLine = lineNumber
      } else {
        console.error('Editor is not initialized')
      }
    }

    const removeHighlight = (lineNumber: number) => {
      if (editor) {
        console.log(`Removing highlight from line: ${lineNumber}`)
        editor.removeLineClass(lineNumber, 'background', 'highlight-line')
        currentHighlightedLine = null
      } else {
        console.error('Editor is not initialized')
      }
    }

    const saveToFile = () => {
      const content = editor.getValue()
      updateCodeStore()
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'code.txt'
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
          editor.setValue(content)
          input.value = ''
          updateCodeStore()
        }
        reader.readAsText(file)
      }
    }

    const triggerFileInput = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }

    return {
      codeStore,
      playsingle,
      playwhole,
      stop,
      highlightLine,
      removeHighlight,
      saveToFile,
      uploadFile,
      triggerFileInput,
      fileInput,
      pipelineStore,
    }
  },
})
</script>


<style>
.CodeMirror {
  height: 80vh !important;
}
</style>

<style scoped>
.codemirror {
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

</style>
