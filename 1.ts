import fs from "fs";

const sum = (a: number, b: number) => a + b;
const requiredFuel = (mass: number) => Math.floor(mass / 3) - 2;
const recursiveRequiredFuel = (mass: number): number => {
  const fuel = requiredFuel(mass);
  return fuel > 0 ? fuel + recursiveRequiredFuel(fuel) : 0;
};

const input = fs
  .readFileSync("1.txt")
  .toString()
  .trim();
const masses = input.split("\n").map(x => parseInt(x, 10));

const totalFuel = masses.map(requiredFuel).reduce(sum);
const totalRecursiveFuel = masses.map(recursiveRequiredFuel).reduce(sum);
console.log(totalFuel);
console.log(totalRecursiveFuel);
