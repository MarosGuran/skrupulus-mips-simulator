import { useCodeStore } from 'src/stores/codeStore'
import { usePipelineStore } from 'src/stores/pipelineStore'
import { useMemoryStore } from 'src/stores/memoryStore'

export class MipsInstruction {
  constructor(
    public address: string = '',
    public raw: string = 'NOP',
    public name: string = '',
    public rs: number | string = 0,
    public rt: number | string = 0,
    public rd: number | string = 0,
    public immediate: number = 0,
    public result: number | undefined = undefined,
  ) {}
}


let fetchStage: MipsInstruction = new MipsInstruction()
let decodeStage: MipsInstruction = new MipsInstruction()
let executeStage: MipsInstruction = new MipsInstruction()
let memoryStage: MipsInstruction = new MipsInstruction()


let pc = 0

export function runMipsPipeline() {
  const codeStore = useCodeStore()
  const pipelineStore = usePipelineStore()
  pipelineStore.resetStages()

  fetchStage = new MipsInstruction()
  decodeStage = new MipsInstruction()
  executeStage = new MipsInstruction()
  memoryStage = new MipsInstruction()


  pc = 0

  while (true) {
    if(pc >= codeStore.codeArray.length || pc > 2000000) {
      break
    }
    const instruction = codeStore.codeArray[pc]

    writeBack()

    memory()

    execute()

    decode()

    if (instruction) {
      fetch(instruction)
    }
    pc++
    // console.log('Pipeline:', pipelineStore.stages)
  }
}

function writeBack() {
  const pipelineStore = usePipelineStore()

  const mipsInst = memoryStage

  pipelineStore.updateStage(4, mipsInst.raw)

  // console.log('Write Back:', mipsInst)
}

function memory() {
  const pipelineStore = usePipelineStore()

  const mipsInst = executeStage

  pipelineStore.updateStage(3, mipsInst.raw)

  memoryStage = mipsInst

  // console.log('Memory:', mipsInst)
}

function execute() {
  const pipelineStore = usePipelineStore()

  const mipsInst = decodeStage

  const hexToDecimal = (hex: string): number => {
    return parseInt(hex, 16)
  }

  switch (mipsInst.name) {
    case 'ADD':{
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = typeof mipsInst.rt === 'string' ? parseInt(mipsInst.rt) : mipsInst.rt
      mipsInst.result = rsValue + rtValue
      break
    }
    case 'ADDI':{
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = hexToDecimal(mipsInst.rt as string)
      mipsInst.result = rsValue + rtValue
      break
    }
    case 'SUB':{
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = typeof mipsInst.rt === 'string' ? parseInt(mipsInst.rt) : mipsInst.rt
      mipsInst.result = rsValue - rtValue
      break
    }
    case 'SUBI':{
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = hexToDecimal(mipsInst.rt as string)
      mipsInst.result = rsValue - rtValue
      break
    }

    }

  pipelineStore.updateStage(2, mipsInst.raw)

  executeStage = mipsInst

  console.log('Execute:', mipsInst)
}

function decode() {
  const pipelineStore = usePipelineStore()
  const memoryStore = useMemoryStore()

  const mipsInst = fetchStage

  if (mipsInst.raw === 'NOP') {
    pipelineStore.updateStage(1, mipsInst.raw)
    decodeStage = mipsInst
    return
  }

  const parts = mipsInst.raw
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')

  mipsInst.name = parts[0] || ''


  const parseRegOrString = (part: string | undefined): number | string => {
    if (!part) return 0

    const registerMatch = part.match(/^\$(\d+)$/)
    if (registerMatch) {
      const regNum = parseInt(registerMatch?.[1] || '0')
      return regNum
    }
    return part
  }

  if (parts.length === 4) {
    mipsInst.rd = parseRegOrString(parts[1])
    mipsInst.rs = parseRegOrString(parts[2])
    mipsInst.rt = parseRegOrString(parts[3])

    if (typeof mipsInst.rs === 'number') {
      mipsInst.rs = memoryStore.readRegister(mipsInst.rs)
    }
    if (typeof mipsInst.rt === 'number') {
      mipsInst.rt = memoryStore.readRegister(mipsInst.rt)
    }
  } else if (parts.length === 3) {
    mipsInst.rd = parseRegOrString(parts[1])
    mipsInst.rs = parseRegOrString(parts[2])

    const third = parts[2] || ''
    if (third.startsWith('$')) {
      mipsInst.rs = parseRegOrString(third)
      if (typeof mipsInst.rs === 'number') {
        mipsInst.rs = memoryStore.readRegister(mipsInst.rs)
      }
    } else {
      mipsInst.immediate = parseInt(third) || 0
    }
  } else if (parts.length === 2) {
    const second = parts[1] || ''
    if (second.startsWith('$')) {
      mipsInst.rd = parseRegOrString(second)
    } else {
      mipsInst.immediate = parseInt(second) || 0
    }
  }

  pipelineStore.updateStage(1, mipsInst.raw)
  decodeStage = mipsInst
  // console.log('Decode:', decodeStage)
}

function fetch(instructionObj: { address: string; instruction: string }) {
  const pipelineStore = usePipelineStore()

  // eslint-disable-next-line prefer-const
  let { address, instruction } = instructionObj
  const tokens = instruction.trim().split(/\s+/)
  let opcode = tokens[0]?.toUpperCase() ?? 'NOP'

  if (instruction === "") {
    instruction = 'NOP'
    opcode = 'NOP'
  }

  const mipsInst = new MipsInstruction(
    address,
    instruction,
    opcode,
  )

  pipelineStore.updateStage(0, mipsInst.raw)

  fetchStage = mipsInst

  // console.log('Fetch:', fetchStage)
}
