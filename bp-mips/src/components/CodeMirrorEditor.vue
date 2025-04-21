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
    <div class="instruction-reference" :class="{ 'expanded': isInstructionPanelExpanded }">
      <div class="instruction-header" @click="toggleInstructionPanel">
        <span>Instruction list</span>
        <q-icon :name="isInstructionPanelExpanded ? 'keyboard_arrow_down' : 'keyboard_arrow_up'" />
      </div>

      <div class="instruction-content" v-if="isInstructionPanelExpanded">
        <div class="instruction-list" v-if="!selectedInstruction">
          <div
            v-for="instruction in mipsInstructions"
            :key="instruction.name"
            class="instruction-item"
            @click="selectInstruction(instruction)">
            <span class="instruction-name">{{ instruction.name }}</span>
            <span class="instruction-syntax">{{ instruction.syntax }}</span>
          </div>
        </div>

        <div class="instruction-detail" v-else>
          <div class="detail-header">
            <q-btn
              dense
              flat
              icon="arrow_back"
              @click="selectedInstruction = null"
              class="back-button" />
            <h3>{{ selectedInstruction.name }}</h3>
          </div>
          <div class="detail-syntax">
            <h4>Syntax:</h4>
            <pre>{{ selectedInstruction.syntax }}</pre>
          </div>
          <div class="detail-description">
            <h4>Description:</h4>
            <p>{{ selectedInstruction.description }}</p>
          </div>
          <div class="detail-example" v-if="selectedInstruction.example">
            <h4>Example:</h4>
            <pre>{{ selectedInstruction.example }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useCodeStore } from 'src/stores/codeStore'
import { usePipelineStore } from 'src/stores/pipelineStore'
import { debugMipsPipeline, runMipsPipeline, resetMipsPipeline } from 'src/utils/mips'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/base16-light.css'

interface MipsInstruction {
  name: string;
  brief: string;
  syntax: string;
  description: string;
  example?: string;
}

export default defineComponent({
  name: 'CodeMirrorEditor',
  setup() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let editor: any
    const fileInput = ref<HTMLInputElement | null>(null)
    let currentHighlightedLine: number | null = null
    const codeStore = useCodeStore()
    const pipelineStore = usePipelineStore()

    const isInstructionPanelExpanded = ref(false)
    const selectedInstruction = ref<MipsInstruction | null>(null)

    const mipsInstructions = ref<MipsInstruction[]>([
      {
        name: 'ADD',
        brief: 'Add',
        syntax: 'ADD $rd, $rs, $rt',
        description: 'Adds the values in registers $rs and $rt and stores the result in register $rd.',
        example: 'ADD $1, $2, $3  # $1 = $2 + $3'
      },
      {
        name: 'ADDI',
        brief: 'Add Immediate',
        syntax: 'ADDI $rt, $rs, immediate',
        description: 'Adds the value in register $rs with the immediate value and stores the result in register $rt. Immediate values are 16-bit integers.',
        example: 'ADDI $1, $2, 100  # $1 = $2 + 100'
      },
      {
        name: 'SUB',
        brief: 'Subtract',
        syntax: 'SUB $rd, $rs, $rt',
        description: 'Subtracts the value in register $rt from the value in register $rs and stores the result in register $rd.',
        example: 'SUB $1, $2, $3  # $1 = $2 - $3'
      },
      {
        name: 'SUBI',
        brief: 'Subtract Immediate',
        syntax: 'SUBI $rt, $rs, immediate',
        description: 'Subtracts the immediate value from the value in register $rs and stores the result in register $rt. Immediate values are 16-bit integers.',
        example: 'SUBI $1, $2, 100  # $1 = $2 - 100'
      },
      {
        name: 'MUL',
        brief: 'Multiply',
        syntax: 'MUL $rd, $rs, $rt',
        description: 'Multiplies the values in registers $rs and $rt and stores the result in register $rd.',
        example: 'MUL $1, $2, $3  # $1 = $2 * $3'
      },
      {
        name: 'MULU',
        brief: 'Multiply Unsigned',
        syntax: 'MULU $rd, $rs, $rt',
        description: 'Multiplies the unsigned values in registers $rs and $rt and stores the result in register $rd.',
        example: 'MULU $1, $2, $3  # $1 = $2 * $3 (unsigned)'
      },
      {
        name: 'DIV',
        brief: 'Divide',
        syntax: 'DIV $rs, $rt',
        description: 'Divides the value in register $rs by the value in register $rt. The quotient is stored in LO and the remainder in HI.',
        example: 'DIV $2, $3  # LO = $2 / $3'
      },
      {
        name: 'DIVU',
        brief: 'Divide Unsigned',
        syntax: 'DIVU $rs, $rt',
        description: 'Divides the unsigned value in register $rs by the unsigned value in register $rt. The quotient is stored in LO and the remainder in HI.',
        example: 'DIVU $2, $3  # LO = $2 / $3 (unsigned)'
      },
      {
        name: 'MFHI',
        brief: 'Move from HI',
        syntax: 'MFHI $rd',
        description: 'Moves the value in HI to register $rd. HI is used to store the remainder from division operations.',
        example: 'MFHI $1  # $1 = HI'
      },
      {
        name: 'SLL',
        brief: 'Shift Left Logical',
        syntax: 'SLL $rd, $rt, shift',
        description: 'Shifts the value in register $rt left by shifting bits and stores the result in register $rd.',
        example: 'SLL $1, $2, 2  # $1 = $2 << 2'
      },
      {
        name: 'SRL',
        brief: 'Shift Right Logical',
        syntax: 'SRL $rd, $rt, shift',
        description: 'Shifts the value in register $rt right by shifting bits and stores the result in register $rd.',
        example: 'SRL $1, $2, 2  # $1 = $2 >> 2'
      },
      {
        name: 'AND',
        brief: 'Bitwise AND',
        syntax: 'AND $rd, $rs, $rt',
        description: 'Performs a bitwise AND operation on the values in registers $rs and $rt and stores the result in register $rd.',
        example: 'AND $1, $2, $3  # $1 = $2 & $3'
      },
      {
        name: 'ANDI',
        brief: 'Bitwise AND Immediate',
        syntax: 'ANDI $rt, $rs, immediate',
        description: 'Performs a bitwise AND operation on the value in register $rs and the immediate value and stores the result in register $rt. Immediate values are 16-bit integers.',
        example: 'ANDI $1, $2, FF  # $1 = $2 & FF'
      },
      {
        name: 'OR',
        brief: 'Bitwise OR',
        syntax: 'OR $rd, $rs, $rt',
        description: 'Performs a bitwise OR operation on the values in registers $rs and $rt and stores the result in register $rd.',
        example: 'OR $1, $2, $3  # $1 = $2 | $3'
      },
      {
        name: 'ORI',
        brief: 'Bitwise OR Immediate',
        syntax: 'ORI $rt, $rs, immediate',
        description: 'Performs a bitwise OR operation on the value in register $rs and the immediate value and stores the result in register $rt. Immediate values are 16-bit integers.',
        example: 'ORI $1, $2, 0xFF  # $1 = $2 | 0xFF'
      },
      {
        name: 'NOR',
        brief: 'Bitwise NOR',
        syntax: 'NOR $rd, $rs, $rt',
        description: 'Performs a bitwise NOR operation on the values in registers $rs and $rt and stores the result in register $rd.',
        example: 'NOR $1, $2, $3  # $1 = ~($2 | $3)'
      },
      {
        name: 'XOR',
        brief: 'Bitwise XOR',
        syntax: 'XOR $rd, $rs, $rt',
        description: 'Performs a bitwise XOR operation on the values in registers $rs and $rt and stores the result in register $rd.',
        example: 'XOR $1, $2, $3  # $1 = $2 ^ $3'
      },
      {
        name: 'XORI',
        brief: 'Bitwise XOR Immediate',
        syntax: 'XORI $rt, $rs, immediate',
        description: 'Performs a bitwise XOR operation on the value in register $rs and the immediate value and stores the result in register $rt. Immediate values are 16-bit integers.',
        example: 'XORI $1, $2, 0xFF  # $1 = $2 ^ 0xFF'
      },
      {
        name: 'BEQ',
        brief: 'Branch if Equal',
        syntax: 'BEQ $rs, $rt, address',
        description: 'Branches to the instruction adress if the values in registers $rs and $rt are equal.',
        example: 'BEQ $1, $2, 0000  # Branch to adress 0000 if $1 == $2'
      },
      {
        name: 'BNE',
        brief: 'Branch if Not Equal',
        syntax: 'BNE $rs, $rt, adress',
        description: 'Branches to the instruction on set adress if the values in registers $rs and $rt are not equal.',
        example: 'BNE $1, $2, 000A  # Branch to adress 000A if $1 != $2'
      },
      {
        name: 'LW',
        brief: 'Load Word',
        syntax: 'LW $rt, offset($rs)',
        description: 'Loads the word at memory location ($rs + offset) into register $rt.',
        example: 'LW $1, 4($2)  # $1 = Memory[$2 + 4]'
      },
      {
        name: 'SW',
        brief: 'Store Word',
        syntax: 'SW $rt, offset($rs)',
        description: 'Stores the word in register $rt into memory at the location ($rs + offset).',
        example: 'SW $1, 4($2)  # Memory[$2 + 4] = $1'
      },
      {
        name: 'LI',
        brief: 'Load Immediate',
        syntax: 'LI $rd, immediate',
        description: 'Loads the immediate value into register $rd. Immediate values are 16-bit integers.',
        example: 'LI $1, 100  # $1 = 100'
      },
      {
        name: 'LUI',
        brief: 'Load Upper Immediate',
        syntax: 'LUI $rt, immediate',
        description: 'Loads the immediate value into the upper half of register $rt. Immediate values are 16-bit integers.',
        example: 'LUI $1, FFFF  # $1 = FFFF 0000'
      },
    ])

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
      resetMipsPipeline()
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

    const toggleInstructionPanel = () => {
      isInstructionPanelExpanded.value = !isInstructionPanelExpanded.value;
      selectedInstruction.value = null;

      if (isInstructionPanelExpanded.value) {
        document.documentElement.style.setProperty('--editor-height', 'calc(50vh - 40px)');
      } else {
        document.documentElement.style.setProperty('--editor-height', 'calc(80vh - 40px)');
      }

      setTimeout(() => {
        if (editor) {
          editor.refresh();
        }
      }, 300);
    }

    const selectInstruction = (instruction: MipsInstruction) => {
      selectedInstruction.value = instruction
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
      isInstructionPanelExpanded,
      mipsInstructions,
      selectedInstruction,
      toggleInstructionPanel,
      selectInstruction,
    }
  },
})
</script>


<style>
.CodeMirror {
  height: var(--editor-height, calc(80vh - 40px)) !important;
  transition: height 0.3s ease;
}
</style>

<style scoped>
.codemirror {
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
  position: relative;
  height: 100%;
}

.buttons-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.instruction-reference {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  z-index: 100;
  transition: transform 0.3s ease;
  color: #ffffff;
  background-color:#1976D2;
}

.instruction-reference:hover {
  background-color: #1763af;
}

.instruction-content {
  position: absolute;
  top: -30vh;
  left: 0;
  right: 0;
  height: 30vh;
  overflow: auto;
  background-color: #3f8ad6;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  visibility: hidden;
}

.instruction-reference.expanded .instruction-content {
  transform: translateY(0);
  visibility: visible;
}

.instruction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: bold;
  height: 40px;
}

.instruction-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  padding: 12px;
}

.instruction-item {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
}

.instruction-item:hover {
  background-color: #e3f2fd;
}

.instruction-name {
  font-weight: bold;
  font-family: monospace;
  color: #ffffff;
}

.instruction-item:hover .instruction-name {
  color: #000000;
}

.instruction-syntax {
  font-size: 0.8em;
  color: #eeeeee;
}
.instruction-item:hover .instruction-syntax {
  color: #818181;
}

.instruction-detail {
  padding: 16px;
  height: 100%;
  overflow: auto;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.detail-header h3 {
  margin: 0;
  font-family: monospace;
  margin-left: 8px;
  font-size: 1.3rem;
}

.detail-syntax h4,
.detail-description h4,
.detail-example h4 {
  font-size: 0.95rem;
  margin-top: 10px;
  margin-bottom: 5px;
}

.detail-description p {
  margin-top: 0;
  margin-bottom: 10px;
}

.detail-syntax pre,
.detail-example pre {
  background-color: #f0f0f0;
  color: #000000;
  padding: 6px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  margin: 5px 0;
}

.detail-syntax,
.detail-description,
.detail-example {
  margin-bottom: 10px;
}

.back-button {
  min-width: 0;
  padding: 4px;
}


.instruction-content::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.instruction-content::-webkit-scrollbar-track {
  background: #3f8ad6;
}

.instruction-content::-webkit-scrollbar-thumb {
  background: #1976D2;
  border-radius: 5px;
  border: 2px solid #3f8ad6;
}

.instruction-content::-webkit-scrollbar-thumb:hover {
  background: #1763af;
}

.instruction-detail::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.instruction-detail::-webkit-scrollbar-track {
  background: #3f8ad6;
}

.instruction-detail::-webkit-scrollbar-thumb {
  background: #1976D2;
  border-radius: 5px;
  border: 2px solid #3f8ad6;
}

.instruction-detail::-webkit-scrollbar-thumb:hover {
  background: #1763af;
}
</style>
