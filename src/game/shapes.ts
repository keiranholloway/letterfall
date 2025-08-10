// File: src/game/shapes.ts
export const SHAPES: Shape[] = [
  // I-piece
  [
    [true],
    [true],
    [true],
    [true]
  ],
  // O-piece
  [
    [true, true],
    [true, true]
  ],
  // T-piece
  [
    [false, true, false],
    [true, true, true]
  ],
  // S-piece
  [
    [false, true, true],
    [true, true, false]
  ],
  // Z-piece
  [
    [true, true, false],
    [false, true, true]
  ],
  // J-piece
  [
    [true, false, false],
    [true, true, true]
  ],
  // L-piece
  [
    [false, false, true],
    [true, true, true]
  ]
];

export type Shape = boolean[][];

export function rotateShape(shape: Shape): Shape {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: Shape = Array(cols).fill(null).map(() => Array(rows).fill(false));
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      rotated[col][rows - 1 - row] = shape[row][col];
    }
  }
  
  return rotated;
}

export function getShapeWidth(shape: Shape): number {
  return shape[0]?.length || 0;
}

export function getShapeHeight(shape: Shape): number {
  return shape.length;
}

export function getShapeCells(shape: Shape): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        cells.push([row, col]);
      }
    }
  }
  return cells;
}

// 7-bag randomizer for Tetris-style distribution
export class SevenBag {
  private bag: number[] = [];
  private rng: any;

  constructor(rng: any) {
    this.rng = rng;
    this.refillBag();
  }

  private refillBag() {
    this.bag = [0, 1, 2, 3, 4, 5, 6];
    // Fisher-Yates shuffle
    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = this.rng.nextInt(i + 1);
      [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
    }
  }

  next(): number {
    if (this.bag.length === 0) {
      this.refillBag();
    }
    return this.bag.pop()!;
  }
}