import fs from 'fs'

const input = fs
  .readFileSync('4.txt')
  .toString()
  .trim()

const [floor, ceil] = input.split('-').map(x => parseInt(x, 10))

let possibilities1 = 0
let possibilities2 = 0
for (let n = floor; n <= ceil; ++n) {
  const digits = n.toString().split('')

  const isSixDigits = digits.length === 6
  const hasAdjascentEqualDigits = digits
    .slice(1)
    .some((d, i) => d === digits[i])
  const hasTwoAdjascentEqualDigits = digits
    .slice(1)
    .some(
      (d, i) =>
        d === digits[i] &&
        (i - 1 < 0 || d !== digits[i - 1]) &&
        (i + 2 >= digits.length || d !== digits[i + 2]),
    )
  const increasingDigits = digits.slice(1).every((d, i) => d >= digits[i])

  if (isSixDigits && hasAdjascentEqualDigits && increasingDigits) {
    ++possibilities1
  }
  if (isSixDigits && hasTwoAdjascentEqualDigits && increasingDigits) {
    ++possibilities2
  }
}
console.log(possibilities1)
console.log(possibilities2)
