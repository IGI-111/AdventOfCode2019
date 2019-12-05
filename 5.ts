import fs from 'fs'

const input = fs
  .readFileSync('5.txt')
  .toString()
  .trim()

const integers = input.split(',').map(x => parseInt(x, 10))

let output1: number = -1
run(integers, { input: () => 1, output: n => (output1 = n) })
console.log(output1)

let output2: number = -1
run(integers, { input: () => 5, output: n => (output2 = n) })
console.log(output2)

const enum Instruction {
  Add = 1,
  Multiply = 2,
  Input = 3,
  Output = 4,
  JumpIfTrue = 5,
  JumpIfFalse = 6,
  LessThan = 7,
  Equals = 8,
  End = 99,
}

function run(
  memory: number[],
  io: { input: () => number; output: (o: number) => void },
): number {
  const mem = memory.slice()

  let ip = 0

  while (true) {
    const { ins, modes } = parseOpcode(mem[ip])

    const modalArg = (i: number) =>
      modes[i] ? mem[ip + 1 + i] : mem[mem[ip + 1 + i]]
    const writeArg = (i: number) => mem[ip + 1 + i]

    switch (ins) {
      case Instruction.Add: {
        const r1 = modalArg(0)
        const r2 = modalArg(1)
        const w = writeArg(2)
        mem[w] = r1 + r2
        ip += 4
        break
      }
      case Instruction.Multiply: {
        const r1 = modalArg(0)
        const r2 = modalArg(1)
        const w = writeArg(2)
        mem[w] = r1 * r2
        ip += 4
        break
      }
      case Instruction.Input: {
        const dest = writeArg(0)
        mem[dest] = io.input()
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
        mem[dest] = r1 < r2 ? 1 : 0
        ip += 4
        break
      }
      case Instruction.Equals: {
        const r1 = modalArg(0)
        const r2 = modalArg(1)
        const dest = writeArg(2)
        mem[dest] = r1 === r2 ? 1 : 0
        ip += 4
        break
      }
      case Instruction.End: {
        return mem[0]
      }
      default:
        throw new Error(`Unknown instruction ${ins}`)
    }
  }
}

function parseOpcode(
  largeOpcode: number,
): { ins: Instruction; modes: boolean[] } {
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
    .map(x => x === '1')

  return { ins, modes }
}
