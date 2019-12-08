import fs from 'fs'

const input = fs
  .readFileSync('8.txt')
  .toString()
  .trim()

const digits = input.split('').map(x => parseInt(x, 10))

const width = 25
const height = 6
const layerLen = width * height

const layers = []
for (let i = 0; i < digits.length; i += layerLen) {
  layers.push(digits.slice(i, i + layerLen))
}
const zeroesCount = layers.map(l => count(l, 0))
const fewestZeroesIndex = zeroesCount.indexOf(Math.min(...zeroesCount))
console.log(
  count(layers[fewestZeroesIndex], 1) * count(layers[fewestZeroesIndex], 2),
)

console.log(render(layers, width, height))

function render(layers: number[][], width: number, height: number): string {
  const image = layers.reverse().reduce((acc, layer) => {
    layer.forEach((p, i) => {
      if (p !== 2) {
        acc[i] = p
      }
    })
    return acc
  }, new Array(width * height).fill(2))

  let res = ''
  const chars: { [pix: number]: string } = {
    2: ' ',
    1: '█',
    0: '░',
  }
  for (let i = 0; i < width * height; i += width) {
    const line = image
      .slice(i, i + width)
      .map((x: number) => chars[x])
      .join('')
    res += line + '\n'
  }
  return res
}

function count(array: any[], val: any): number {
  return array.reduce((acc, x) => (x === val ? acc + 1 : acc), 0)
}
