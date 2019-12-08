import fs from 'fs'
import { Channel } from 'ts-csp'
;(async () => {
  const input = fs
    .readFileSync('7.txt')
    .toString()
    .trim()

  const program = input.split(',').map(x => parseInt(x, 10))

  const maxSignal = (
    await Promise.all(
      permutations([0, 1, 2, 3, 4]).map(async phaseSettings => {
        let signal = 0
        for (let i = 0; i < 5; ++i) {
          signal = await runAmplifier(program, phaseSettings[i], signal)
        }
        return signal
      }),
    )
  ).reduce((acc, x) => (x > acc ? x : acc), 0)
  console.log(maxSignal)

  const maxFeedbackSignal = (
    await Promise.all(
      permutations([5, 6, 7, 8, 9]).map(async phaseSettings => {
        const channels: Channel[] = []
        for (let i = 0; i < 5; ++i) {
          const c = new Channel()
          c.put(phaseSettings[i])
          channels.push(c)
        }
        const amplifiers = phaseSettings.map((_, i) =>
          runFeedbackAmplifier(program, channels[i], channels[(i + 5 + 1) % 5]),
        )
        channels[0].put(0)
        await Promise.all(amplifiers)
        return await channels[0].take()
      }),
    )
  ).reduce((acc, x) => (x > acc ? x : acc), 0)
  console.log(maxFeedbackSignal)
})()

async function runFeedbackAmplifier(
  program: number[],
  inputChannel: Channel,
  outputChannel: Channel,
): Promise<void> {
  await run(program, {
    input: async () => inputChannel.take(),
    output: async o => {
      outputChannel.put(o)
    },
  })
}

async function runAmplifier(
  program: number[],
  phaseSetting: number,
  input: number,
): Promise<number> {
  const inputs = [input, phaseSetting]
  let output = 0
  await run(program, {
    input: () => Promise.resolve(inputs.pop()!),
    output: async o => {
      output = o
    },
  })
  return output
}

function permutations(vals: any[]): any[][] {
  let ret = []
  for (let i = 0; i < vals.length; i = i + 1) {
    let rest = permutations(vals.slice(0, i).concat(vals.slice(i + 1)))

    if (!rest.length) {
      ret.push([vals[i]])
    } else {
      for (let j = 0; j < rest.length; j = j + 1) {
        ret.push([vals[i]].concat(rest[j]))
      }
    }
  }
  return ret
}

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

async function run(
  memory: number[],
  io: { input: () => Promise<number>; output: (o: number) => Promise<void> },
) {
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
        mem[dest] = await io.input()
        ip += 2
        break
      }
      case Instruction.Output: {
        const src = modalArg(0)
        await io.output(src)
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
        return
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
