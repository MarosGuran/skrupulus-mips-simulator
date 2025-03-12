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

let mfhi: number = 0


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

  switch (mipsInst.name) {
    case 'LW': {
      const memoryStore = useMemoryStore()
      const value = memoryStore.readMemory(mipsInst.rt as number)
      memoryStore.writeRegister(mipsInst.rd as number, value)
      break
    }
    case 'SW': {
      const memoryStore = useMemoryStore()
      memoryStore.writeMemory(mipsInst.rt as number, mipsInst.result as number)
      break
    }
    case 'LI': {
      const memoryStore = useMemoryStore()
      memoryStore.writeRegister(mipsInst.rd as number, mipsInst.result as number)
      break
    }
    case 'LUI': {
      const memoryStore = useMemoryStore()
      memoryStore.writeRegister(mipsInst.rd as number, mipsInst.result as number)
      break
    }
  }

  pipelineStore.updateStage(3, mipsInst.raw)

  memoryStage = mipsInst

  console.log('Memory:', mipsInst)
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
    case 'MUL':{
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = typeof mipsInst.rt === 'string' ? parseInt(mipsInst.rt) : mipsInst.rt
      mipsInst.result = rsValue * rtValue
      break
    }
    case 'MULU': {
      const rsValue = typeof mipsInst.rs === 'string' ?
        parseInt(mipsInst.rs) >>> 0 : mipsInst.rs >>> 0;
      const rtValue = typeof mipsInst.rt === 'string' ?
        parseInt(mipsInst.rt) >>> 0 : mipsInst.rt >>> 0;

      mipsInst.result = (rsValue * rtValue) >>> 0;
      break;
    }
    case 'DIV': {
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = typeof mipsInst.rt === 'string' ? parseInt(mipsInst.rt) : mipsInst.rt

      if (rtValue === 0) {
        console.error("Division by zero attempted")
        mipsInst.result = 0
        mfhi = 0
      } else {
        mipsInst.result = Math.floor(rsValue / rtValue)
        mfhi = rsValue % rtValue
      }
      break
    }
    case 'DIVU': {
      const rsValue = typeof mipsInst.rs === 'string' ?
        parseInt(mipsInst.rs) >>> 0 : mipsInst.rs >>> 0;
      const rtValue = typeof mipsInst.rt === 'string' ?
        parseInt(mipsInst.rt) >>> 0 : mipsInst.rt >>> 0;

      if (rtValue === 0) {
        console.error("Division by zero attempted")
        mipsInst.result = 0
        mfhi = 0
      } else {
        mipsInst.result = Math.floor(rsValue / rtValue)
        mfhi = rsValue % rtValue
      }
      break
    }
    case 'MFHI': {
      mipsInst.result = mfhi
      break
    }
    case 'SLL': {
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = typeof mipsInst.rt === 'string' ? parseInt(mipsInst.rt) : mipsInst.rt
      mipsInst.result = rsValue << rtValue
      break
    }
    case 'SRL': {
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = typeof mipsInst.rt === 'string' ? parseInt(mipsInst.rt) : mipsInst.rt
      mipsInst.result = rsValue >>> rtValue
      break
    }
    case 'AND':{
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = typeof mipsInst.rt === 'string' ? parseInt(mipsInst.rt) : mipsInst.rt
      mipsInst.result = rsValue & rtValue
      break
    }
    case 'ANDI': {
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = hexToDecimal(mipsInst.rt as string)
      mipsInst.result = rsValue & rtValue
      break
    }
    case 'OR':{
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = typeof mipsInst.rt === 'string' ? parseInt(mipsInst.rt) : mipsInst.rt
      mipsInst.result = rsValue | rtValue
      break
    }
    case 'ORI': {
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = hexToDecimal(mipsInst.rt as string)
      mipsInst.result = rsValue | rtValue
      break
    }
    case 'NOR':{
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = typeof mipsInst.rt === 'string' ? parseInt(mipsInst.rt) : mipsInst.rt
      mipsInst.result = ~(rsValue | rtValue)
      break
    }
    case 'XOR':{
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = typeof mipsInst.rt === 'string' ? parseInt(mipsInst.rt) : mipsInst.rt
      mipsInst.result = rsValue ^ rtValue
      break
    }
    case 'XORI': {
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = hexToDecimal(mipsInst.rt as string)
      mipsInst.result = rsValue ^ rtValue
      break
    }
    case 'BEQ': {
      const memoryStore = useMemoryStore()
      const rdValue = memoryStore.readRegister(mipsInst.rd as number)
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      if (rsValue === rdValue) {
        pc = hexToDecimal(mipsInst.rt as string) - 1
      }
      break
    }
    case 'BNE': {
      const memoryStore = useMemoryStore()
      const rdValue = memoryStore.readRegister(mipsInst.rd as number)
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      if (rsValue !== rdValue) {
        pc = hexToDecimal(mipsInst.rt as string) - 1
      }
      break
    }
    case 'LW': {
      const memoryStore = useMemoryStore()
      if (typeof mipsInst.rs === 'string' && mipsInst.rs.includes('(')) {
        const parts = mipsInst.rs.split('(')
        const offset = hexToDecimal(parts[0] || '0')
        const regStr = parts[1]?.replace(')', '').replace('$', '') || '0'
        const regNum = parseInt(regStr)

        const baseAddress = memoryStore.readRegister(regNum)
        mipsInst.rt = baseAddress + offset
      }
      break
    }
    case 'SW': {
      const memoryStore = useMemoryStore()
      if (typeof mipsInst.rs === 'string' && mipsInst.rs.includes('(')) {
        const parts = mipsInst.rs.split('(')
        const offset = hexToDecimal(parts[0] || '0')
        const regStr = parts[1]?.replace(')', '').replace('$', '') || '0'
        const regNum = parseInt(regStr)

        const baseAddress = memoryStore.readRegister(regNum)
        mipsInst.result = memoryStore.readRegister(mipsInst.rd as number)
        mipsInst.rt = baseAddress + offset
      }
      break
    }
    case 'LI': {
      const immediateValue = typeof mipsInst.rs === 'string' ? hexToDecimal(mipsInst.rs) : mipsInst.rs
      mipsInst.result = immediateValue
      break
    }
    case 'LUI': {
      const immediateValue = typeof mipsInst.rs === 'string' ? hexToDecimal(mipsInst.rs) : mipsInst.rs
      mipsInst.result = (immediateValue & 0xFFFF) << 16
      break
    }
  }


  pipelineStore.updateStage(2, mipsInst.raw)

  executeStage = mipsInst

  // console.log('Execute:', mipsInst)
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
