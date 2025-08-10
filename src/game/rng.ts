// File: src/game/rng.ts
export class SplitMix64 {
  private state: bigint;

  constructor(seed: number | bigint = Date.now()) {
    this.state = BigInt(seed);
  }

  next(): number {
    this.state = (this.state + 0x9e3779b97f4a7c15n) & 0xffffffffffffffffn;
    let z = this.state;
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & 0xffffffffffffffffn;
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & 0xffffffffffffffffn;
    z = z ^ (z >> 31n);
    return Number(z & 0xffffffffn) / 0x100000000;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  nextBool(probability = 0.5): boolean {
    return this.next() < probability;
  }

  clone(): SplitMix64 {
    const cloned = new SplitMix64(0);
    cloned.state = this.state;
    return cloned;
  }

  getSeed(): bigint {
    return this.state;
  }
}