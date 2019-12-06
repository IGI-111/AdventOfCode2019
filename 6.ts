import fs from 'fs'

class OrbitTree {
  tree: { [around: string]: string | null }
  constructor(orbits: Array<[string, string]>) {
    this.tree = {}
    for (const [center, around] of orbits) {
      if (!this.tree[center]) {
        this.tree[center] = null
      }
      this.tree[around] = center
    }
  }
  private path(obj: string): string[] {
    if (this.tree[obj] === null) {
      return []
    }
    const orbits: string[] = [this.tree[obj]!]
    while (this.tree[orbits[orbits.length - 1]!] !== null) {
      orbits.push(this.tree[orbits[orbits.length - 1]]!)
    }
    return orbits
  }
  private treeDistance(obj1: string, obj2: string): number {
    const obj1Path = [obj1, ...this.path(obj1)]
    const obj2Path = [obj2, ...this.path(obj2)]

    while (obj1Path[obj1Path.length - 1] === obj2Path[obj2Path.length - 1]) {
      obj1Path.pop()
      obj2Path.pop()
    }
    return obj1Path.length + obj2Path.length
  }
  transferDistance(obj1: string, obj2: string): number {
    return this.treeDistance(this.tree[obj1]!, this.tree[obj2]!)
  }
  totalOrbits(): number {
    return Object.keys(this.tree)
      .map(obj => this.path(obj).length)
      .reduce((a, b) => a + b, 0)
  }
}

const input = fs
  .readFileSync('6.txt')
  .toString()
  .trim()

const orbits = input.split('\n').map((x: string): [string, string] => {
  const entry = x.split(')')
  return [entry[0], entry[1]]
})
const orbitTree = new OrbitTree(orbits)
console.log(orbitTree.totalOrbits())
console.log(orbitTree.transferDistance('YOU', 'SAN'))
