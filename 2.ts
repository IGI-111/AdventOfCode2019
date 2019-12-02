import fs from 'fs'

const input = fs
  .readFileSync('2.txt')
  .toString()
  .trim()

const integers = input.split(',').map(x => parseInt(x, 10))

console.log(run(12, 2, integers))

const found = findOutput(19690720, integers)!
console.log(100 * found.noun + found.verb)

function findOutput(
  desired: number,
  memory: number[],
): { noun: number; verb: number } | null {
  for (let noun = 0; noun < 100; ++noun) {
    for (let verb = 0; verb < 100; ++verb) {
      if (run(noun, verb, memory) === desired) {
        return { noun, verb }
      }
    }
  }
  return null
}

function run(noun: number, verb: number, memory: number[]): number {
  const mem = memory.slice()
  mem[1] = noun
  mem[2] = verb

  let ip = 0
  while (true) {
    const r1 = mem[ip + 1]
    const r2 = mem[ip + 2]
    const w = mem[ip + 3]
    if (mem[ip] === 1) {
      mem[w] = mem[r1] + mem[r2]
    } else if (mem[ip] === 2) {
      mem[w] = mem[r1] * mem[r2]
    } else if (mem[ip] === 99) {
      break
    } else {
      throw new Error('Unknown Opcode')
    }

    ip += 4
  }
  return mem[0]
}
