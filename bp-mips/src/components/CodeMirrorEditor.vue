<template>
  <div class="codemirror" style="width: 22vw">
    <div class="buttons-container">
      <q-btn icon="play_arrow" @click="playsingle"></q-btn>
      <q-btn icon="fast_forward" @click="playwhole"></q-btn>
      <q-btn icon="download" @click="saveToFile"></q-btn>
      <q-btn icon="upload_file" @click="triggerFileInput"></q-btn>
      <input type="file" @change="uploadFile" ref="fileInput" style="display: none;" />
    </div>
    <textarea id="editorContainer"></textarea>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const CodeMirror: any

export default defineComponent({
  name: 'CodeMirrorEditor',
  setup() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let editor: any
    const fileInput = ref<HTMLInputElement | null>(null)

    onMounted(() => {
      const textarea = document.getElementById('editorContainer')
      if (textarea) {
        editor = CodeMirror.fromTextArea(textarea, {
          lineNumbers: true,
          mode: 'python',
          theme: 'base16-light',
          lineNumberFormatter: (line: number) => {
            return (line - 1).toString(16).toUpperCase().padStart(4, '0')
          },
          extraKeys: { 'Ctrl-Space': 'autocomplete' },
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        editor.on('inputRead', function onInputRead(cm: any, change: any) {
          if (change.text[0] && /[a-zA-Z]/.test(change.text[0])) {
            cm.showHint({ completeSingle: false })
          }
        })
      }
    })

    const playsingle = () => {
      const editorContent = editor.getValue()
      passTextToOtherProgram(editorContent)
      highlightLine(5)
      setTimeout(() => {
        removeHighlight(5)
      }, 2000)
    }

    const playwhole = () => {
      const editorContent = editor.getValue()
      passTextToOtherProgram(editorContent)
      highlightLine(5)
      setTimeout(() => {
        removeHighlight(5)
      }, 2000)
    }

    const passTextToOtherProgram = (text: string) => {
      console.log('Text from CodeMirror:', text)
    }

    const highlightLine = (lineNumber: number) => {
      if (editor) {
        console.log(`Highlighting line: ${lineNumber}`)
        editor.addLineClass(lineNumber - 1, 'background', 'highlight-line')
      } else {
        console.error('Editor is not initialized')
      }
    }

    const removeHighlight = (lineNumber: number) => {
      if (editor) {
        console.log(`Removing highlight from line: ${lineNumber}`)
        editor.removeLineClass(lineNumber - 1, 'background', 'highlight-line')
      } else {
        console.error('Editor is not initialized')
      }
    }

    const saveToFile = () => {
      const content = editor.getValue()
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
      playsingle,
      playwhole,
      highlightLine,
      removeHighlight,
      saveToFile,
      uploadFile,
      triggerFileInput,
      fileInput,
    }
  },
})
</script>

<style scoped>
.codemirror {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.buttons-container {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

</style>
