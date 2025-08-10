// File: src/game/pieceGen.ts
import { SHAPES, SevenBag, getShapeCells, type Shape } from './shapes';
import { getRandomLetter, WILDCARD_CHAR, BOMB_CHAR } from './letters';
import type { Piece } from './types';

export class PieceGenerator {
  private sevenBag: SevenBag;
  private rng: any;

  constructor(rng: any) {
    this.rng = rng;
    this.sevenBag = new SevenBag(rng);
  }

  generatePiece(): Piece {
    const shapeIndex = this.sevenBag.next();
    const shape = SHAPES[shapeIndex];
    const cells = getShapeCells(shape);
    const letters: string[] = [];

    for (let i = 0; i < cells.length; i++) {
      // Small chance for special tiles
      const rand = this.rng.next();
      if (rand < 0.02) {
        letters.push(WILDCARD_CHAR); // 2% wildcard
      } else if (rand < 0.025) {
        letters.push(BOMB_CHAR); // 0.5% bomb
      } else {
        letters.push(getRandomLetter(this.rng));
      }
    }

    return {
      shape,
      letters,
      row: 0,
      col: Math.floor((10 - shape[0].length) / 2), // Center horizontally
      rot: 0
    };
  }

  generateQueue(size: number): Shape[] {
    const queue: Shape[] = [];
    for (let i = 0; i < size; i++) {
      const shapeIndex = this.sevenBag.next();
      queue.push(SHAPES[shapeIndex]);
    }
    return queue;
  }
}