import { useCodeStore } from 'src/stores/codeStore'

export class MipsInstruction {
  constructor(
    public address: string = '',
    public raw: string = '',
    public name: string = 'NOP',
    public rs: number = 0,
    public rt: number = 0,
    public rd: number = 0,
    public immediate: number = 0,
  ) {}
}

export function runMipsPipeline() {
  let pc = 0
  const codeStore = useCodeStore()
  while (true) {
    if(pc >= codeStore.codeArray.length + 5 || pc > 2000000) {
      break
    }
    const instruction = codeStore.codeArray[pc]
    console.log(instruction)
    pc++
  }
}
