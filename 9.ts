import fs from 'fs'

const input = fs
  .readFileSync('9.txt')
  .toString()
  .trim()

const integers = input.split(',').map(x => parseInt(x, 10))

run(integers, {
  input: () => 1,
  output: n => {
    console.log(n)
  },
})
run(integers, {
  input: () => 2,
  output: n => {
    console.log(n)
  },
})

const enum Instruction {
  Add = 1,
  Multiply = 2,
  Input = 3,
  Output = 4,
  JumpIfTrue = 5,
  JumpIfFalse = 6,
  LessThan = 7,
  Equals = 8,
  RelativeBaseOffset = 9,
  End = 99,
}

const enum Mode {
  Position = 0,
  Immediate = 1,
  Relative = 2,
}

function run(
  memory: number[],
  io: { input: () => number; output: (o: number) => void },
) {
  const mem = memory.slice()
  const get = (addr: number) => {
    if (addr < 0) {
      throw new Error('Invalid read address')
    }
    return mem[addr]
  }
  const set = (addr: number, val: number) => {
    if (addr < 0) {
      throw new Error('Invalid write address')
    }
    mem[addr] = val
  }

  let ip = 0
  let relativeBase = 0

  while (true) {
    const { ins, modes } = parseOpcode(get(ip))

    const modalArg = (i: number) => {
      switch (modes[i]) {
        case Mode.Immediate:
          return get(ip + 1 + i)
        case Mode.Position:
          return get(get(ip + 1 + i))
        case Mode.Relative:
          return get(relativeBase + get(ip + 1 + i))
        default:
          throw new Error('Unknown mode')
      }
    }
    const writeArg = (i: number) => {
      switch (modes[i]) {
        case Mode.Position:
          return get(ip + 1 + i)
        case Mode.Relative:
          return relativeBase + get(ip + 1 + i)
        default:
          throw new Error('Unknown mode')
      }
    }

    // console.log(ins, modes)
    switch (ins) {
      case Instruction.Add: {
        const r1 = modalArg(0)
        const r2 = modalArg(1)
        const w = writeArg(2)
        set(w, r1 + r2)
        ip += 4
        break
      }
      case Instruction.Multiply: {
        const r1 = modalArg(0)
        const r2 = modalArg(1)
        const w = writeArg(2)
        set(w, r1 * r2)
        ip += 4
        break
      }
      case Instruction.Input: {
        const dest = writeArg(0)
        set(dest, io.input())
        ip += 2
        break
      }
      case Instruction.Output: {
        const src = modalArg(0)
        io.output(src)
        ip += 2
        break
      }
      case Instruction.JumpIfFalse: {
        const cond = modalArg(0)
        const dest = modalArg(1)
        if (cond === 0) {
          ip = dest
        } else {
          ip += 3
        }
        break
      }
      case Instruction.JumpIfTrue: {
        const cond = modalArg(0)
        const dest = modalArg(1)
        if (cond !== 0) {
          ip = dest
        } else {
          ip += 3
        }
        break
      }
      case Instruction.LessThan: {
        const r1 = modalArg(0)
        const r2 = modalArg(1)
        const dest = writeArg(2)
        set(dest, r1 < r2 ? 1 : 0)
        ip += 4
        break
      }
      case Instruction.Equals: {
        const r1 = modalArg(0)
        const r2 = modalArg(1)
        const dest = writeArg(2)
        set(dest, r1 === r2 ? 1 : 0)
        ip += 4
        break
      }
      case Instruction.RelativeBaseOffset: {
        const of = modalArg(0)
        relativeBase += of
        ip += 2
        break
      }
      case Instruction.End: {
        return
      }
      default:
        throw new Error(`Unknown instruction ${ins}`)
    }
  }
}

function parseOpcode(largeOpcode: number): { ins: Instruction; modes: Mode[] } {
  const digits = largeOpcode
    .toString()
    .padStart(5, '0')
    .split('')
  const ins: Instruction = parseInt(
    digits.slice(digits.length - 2).join(''),
    10,
  )

  const modes = digits
    .slice(0, digits.length - 2)
    .reverse()
    .map(x => parseInt(x, 10))

  return { ins, modes }
}
