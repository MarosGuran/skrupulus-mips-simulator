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
    public memoryAddress: number | undefined = undefined,
    public memoryValue: number | undefined = undefined,
    public branchrdvalue: number | undefined = undefined,
  ) {}
}


let fetchStage: MipsInstruction = new MipsInstruction()
let decodeStage: MipsInstruction = new MipsInstruction()
let executeStage: MipsInstruction = new MipsInstruction()
let memoryStage: MipsInstruction = new MipsInstruction()
export let currentInstructionLine = -1;

let mfhi: number = 0


let pc = 0

export function resetMipsPipeline() {
  const pipelineStore = usePipelineStore()
  pipelineStore.resetStages()

  fetchStage = new MipsInstruction()
  decodeStage = new MipsInstruction()
  executeStage = new MipsInstruction()
  memoryStage = new MipsInstruction()

  mfhi = 0
  currentInstructionLine = -1
  pc = 0
}

export function resetMipsProgramCounter() {
  pc = 0
}

export function debugMipsPipeline() {
  const codeStore = useCodeStore()
  const pipelineStore = usePipelineStore()


  if(pc >= codeStore.codeArray.length || pc > 2000000) {
    pipelineStore.stopExecution()
  } else {
  const instruction = codeStore.codeArray[pc]

  writeBack()

  memory()

  execute()

  decode()

  if (instruction) {
    fetch(instruction)
    pc++
    return currentInstructionLine;
  } else {
    pc++
  }
  }
  return -1;
}


export async function runMipsPipeline() {
  const codeStore = useCodeStore()
  const pipelineStore = usePipelineStore()
  resetMipsPipeline()
  pipelineStore.startExecution()


  function delay(t: number) {
    return new Promise( resolve => setTimeout(resolve, t) );
  }

  while (pipelineStore.isRunning) {
    if(pc >= codeStore.codeArray.length || pc > 2000000) {
      pipelineStore.stopExecution()
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

    await delay(pipelineStore.executionSpeed);
  }
}

function writeBack() {
  const memoryStore = useMemoryStore()

  const mipsInst = memoryStage

  const writeBackInstructions = [
    'ADD', 'ADDI', 'SUB', 'SUBI', 'MUL', 'MULU', 'DIV', 'DIVU',
    'AND', 'ANDI', 'OR', 'ORI', 'XOR', 'XORI', 'NOR',
    'SLL', 'SRL',
    'MFHI',
    'LW','LI','LUI',
  ];

  if (writeBackInstructions.includes(mipsInst.name)) {
    memoryStore.writeRegister(mipsInst.rd as number, mipsInst.result as number);
  }

}

function memory() {
  const mipsInst = executeStage

  switch (mipsInst.name) {
    case 'LW': {
      const memoryStore = useMemoryStore()
      const value = memoryStore.readMemory(mipsInst.rt as number)
      mipsInst.result = value
      break
    }
    case 'SW': {
      const memoryStore = useMemoryStore()
      memoryStore.writeMemory(mipsInst.rt as number, mipsInst.result as number)
      break
    }
  }


  memoryStage = mipsInst
}

function execute() {
  const mipsInst = decodeStage

  const hexToDecimal = (hex: string): number => {
    return parseInt(hex, 16)
  }

  switch (mipsInst.name) {
    case 'ADD':{
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = typeof mipsInst.rt === 'string' ? parseInt(mipsInst.rt) : mipsInst.rt
      mipsInst.result = (rsValue + rtValue) | 0
      break
    }
    case 'ADDI':{
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = hexToDecimal(mipsInst.rt as string)
      mipsInst.result = (rsValue + signExtend16To32(rtValue)) | 0
      break
    }
    case 'SUB':{
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = typeof mipsInst.rt === 'string' ? parseInt(mipsInst.rt) : mipsInst.rt
      mipsInst.result = (rsValue - rtValue) | 0
      break
    }
    case 'SUBI':{
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = hexToDecimal(mipsInst.rt as string)
      mipsInst.result = (rsValue - signExtend16To32(rtValue)) | 0
      break
    }
    case 'MUL':{
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = typeof mipsInst.rt === 'string' ? parseInt(mipsInst.rt) : mipsInst.rt
      mipsInst.result = (rsValue * rtValue) | 0
      break
    }
    case 'MULU': {
      const rsValue = typeof mipsInst.rs === 'string' ?
        parseInt(mipsInst.rs) >>> 0 : mipsInst.rs >>> 0;
      const rtValue = typeof mipsInst.rt === 'string' ?
        parseInt(mipsInst.rt) >>> 0 : mipsInst.rt >>> 0;

      mipsInst.result = ((rsValue * rtValue) | 0) >>> 0;
      break;
    }
    case 'DIV': {
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      const rtValue = typeof mipsInst.rt === 'string' ? parseInt(mipsInst.rt) : mipsInst.rt

      if (rtValue === 0) {
        console.error("Division by zero attempted")
        alert("Division by zero attempted ignoring instruction")
        mipsInst.result = 0
        mfhi = 0
      } else {
        mipsInst.result = (Math.floor(rsValue / rtValue)) | 0
        mfhi = (rsValue % rtValue) | 0
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
        alert("Division by zero attempted ignoring instruction")
        mipsInst.result = 0
        mfhi = 0
      } else {
        mipsInst.result = (((Math.floor(rsValue / rtValue)) | 0) >>> 0);
        mfhi = ((rsValue % rtValue) | 0) >>> 0;
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
      const rdValue = mipsInst.branchrdvalue
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      if (rsValue === rdValue) {
        const target = hexToDecimal(mipsInst.rt as string)
        pc = signExtend16To32(target) - 1
      }
      break
    }
    case 'BNE': {
      const rdValue = mipsInst.branchrdvalue
      const rsValue = typeof mipsInst.rs === 'string' ? parseInt(mipsInst.rs) : mipsInst.rs
      if (rsValue !== rdValue) {
        const target = hexToDecimal(mipsInst.rt as string)
        pc = signExtend16To32(target) - 1
      }
      break
    }
    case 'LW': {
      mipsInst.rt = mipsInst.memoryAddress as number
      break
    }
    case 'SW': {
      mipsInst.result = mipsInst.memoryValue
      mipsInst.rt = mipsInst.memoryAddress as number
      break
    }
    case 'LI': {
      const immediateValue = typeof mipsInst.rs === 'string' ? hexToDecimal(mipsInst.rs) : mipsInst.rs
      mipsInst.result = signExtend16To32(immediateValue)
      break
    }
    case 'LUI': {
      const immediateValue = typeof mipsInst.rs === 'string' ? hexToDecimal(mipsInst.rs) : mipsInst.rs
      mipsInst.result = (immediateValue & 0xFFFF) << 16
      break
    }
  }



  executeStage = mipsInst
}

function decode() {
  const memoryStore = useMemoryStore()
  const mipsInst = fetchStage

  if (mipsInst.raw === 'NOP') {
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
    } else if (!Number.isNaN(parseInt(part,16))) {
      if ((part.length > 4 && !part.includes('(')) || part.split('(')[0]!.length > 4) {
        const original = part
        const part1 = part.slice(0,4)
        const warningMessage = `Warning: Immediate value '${original}' exceeds 16 bits. Truncated to '${part1}'`
        part = part1
        alert(warningMessage)
      }
    }
    return part
  }

  if (parts.length === 4) {
    mipsInst.rd = parseRegOrString(parts[1])
    mipsInst.branchrdvalue = memoryStore.readRegister(mipsInst.rd as number)
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

    if (parts[2]?.includes('(')) {
      const parts2 = parts[2].split('(')
      const offsetStr = parts2[0] || '0'
      const offset = offsetStr === '' ? 0 : parseInt(parseRegOrString(offsetStr) as string, 16)

      const regStr = parts2[1]?.replace(')', '').replace('$', '') || '0'
      const regNum = parseInt(regStr)
      const baseAddress = memoryStore.readRegister(regNum)

      mipsInst.memoryAddress = baseAddress + signExtend16To32(offset)
      mipsInst.memoryValue = memoryStore.readRegister(mipsInst.rd as number)
    } else {
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
  }
  } else if (parts.length === 2) {
    const second = parts[1] || ''
    if (second.startsWith('$')) {
      mipsInst.rd = parseRegOrString(second)
    } else {
      mipsInst.immediate = parseInt(second) || 0
    }
  }

  decodeStage = mipsInst
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

  pipelineStore.pushInstruction(mipsInst.raw)

  currentInstructionLine = parseInt(address, 16) || 0;

  fetchStage = mipsInst
}


function signExtend16To32(value: number): number {
  if (value & 0x8000) {
    return value | 0xFFFF0000;
  } else {
    return value;
  }
}
