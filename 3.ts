import fs from 'fs'

type Squares = {
  [squareKey: string]: {
    [path: number]: number
  }
}
type Direction = 'U' | 'D' | 'L' | 'R'
function isDirection(dir: string): dir is Direction {
  return dir === 'U' || dir === 'D' || dir === 'L' || dir === 'R'
}

class Coordinate {
  x: number
  y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
  toString(): string {
    return `${this.x},${this.y}`
  }
  static fromString(str: string): Coordinate {
    const [x, y] = str.split(',').map(x => parseInt(x, 10))
    return new Coordinate(x, y)
  }
  manathanDist(): number {
    return Math.abs(this.x) + Math.abs(this.y)
  }
  stepDist(squares: Squares): number {
    const steps = squares[this.toString()]
    return Object.values(steps).reduce((a, b) => a + b, 0)
  }
}

function markLine(
  squares: Squares,
  dir: Direction,
  length: number,
  coor: Coordinate,
  marker: number,
  step: number,
) {
  const incrementFun = {
    U: () => --coor.y,
    D: () => ++coor.y,
    L: () => --coor.x,
    R: () => ++coor.x,
  }

  for (let i = 0; i < length; ++i) {
    incrementFun[dir]()
    const squareKey = coor.toString()
    if (!(squareKey in squares)) {
      squares[squareKey] = {}
    }
    if (marker in squares[squareKey]) {
      squares[squareKey][marker] = Math.min(
        squares[squareKey][marker],
        step + i,
      )
    } else {
      squares[squareKey][marker] = step + i
    }
  }
}

const input = fs
  .readFileSync('3.txt')
  .toString()
  .trim()
const wirePaths = input.split('\n').map(p => p.trim().split(','))

const squares: Squares = {}
for (const [pathNumber, path] of wirePaths.entries()) {
  const coor = new Coordinate(0, 0)
  let step = 1
  for (const move of path) {
    const dir = move[0]
    if (!isDirection(dir)) {
      throw new Error('Unknown direction')
    }
    const length = parseInt(move.slice(1), 10)
    markLine(squares, dir, length, coor, pathNumber, step)
    step += length
  }
}
const intersections = Object.entries(squares)
  .filter(([_c, paths]) => Object.keys(paths).length > 1)
  .map(([c, _paths]): Coordinate => Coordinate.fromString(c))

const manathanIntersection = intersections.reduce(
  (best, cur) => (cur.manathanDist() < best.manathanDist() ? cur : best),
  intersections[0],
)
console.log(manathanIntersection.manathanDist())

const stepIntersection = intersections.reduce(
  (best, cur) => (cur.stepDist(squares) < best.stepDist(squares) ? cur : best),
  intersections[0],
)
console.log(stepIntersection.stepDist(squares))
