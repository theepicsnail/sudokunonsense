// src/SudokuBoard.ts

export class SudokuBoard {
  private frozen: boolean[][];
  private candidates: Set<number>[][];

  constructor() {
    this.frozen = Array.from({ length: 9 }, () => Array(9).fill(false));
    this.candidates = Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]))
    );
  }

  
  /** Get the candidate set for a cell */
  getCandidates(row: number, col: number): Set<number> {
    return this.candidates[row][col];
  }

  /** Set the candidate set for a cell */
  setCandidates(row: number, col: number, candidates: Iterable<number>) {
    if (this.frozen[row][col]) return;
    this.candidates[row][col] = new Set(candidates);
  }

  /** Add a candidate to a cell */
  addCandidate(row: number, col: number, candidate: number) {
    if (this.frozen[row][col]) return;
    this.candidates[row][col].add(candidate);
  }

  /** Remove a candidate from a cell */
  removeCandidate(row: number, col: number, candidate: number) {
    if (this.frozen[row][col]) return;
    this.candidates[row][col].delete(candidate);
  }

  getBoard(): number[][] {
    // Return a deep copy to prevent external mutation
    return this.candidates.map(row => row.map(candidates => candidates.size === 1 ? Array.from(candidates)[0] : 0));
  }

  isFrozen(row: number, col: number): boolean {
    return this.frozen[row][col];
  }

  setFrozen(row: number, col: number, frozen: boolean = true) {
    this.frozen[row][col] = frozen;
  }

  reset() {
    this.frozen = Array.from({ length: 9 }, () => Array(9).fill(false));
    this.candidates = Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]))
    );
  }
}
