// src/SudokuBoard.ts
export class SudokuBoard {
    constructor() {
        this.frozen = Array.from({ length: 9 }, () => Array(9).fill(false));
        this.candidates = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])));
    }
    /** Get the candidate set for a cell */
    getCandidates(row, col) {
        return this.candidates[row][col];
    }
    /** Set the candidate set for a cell */
    setCandidates(row, col, candidates) {
        if (this.frozen[row][col])
            return;
        this.candidates[row][col] = new Set(candidates);
    }
    /** Add a candidate to a cell */
    addCandidate(row, col, candidate) {
        if (this.frozen[row][col])
            return;
        this.candidates[row][col].add(candidate);
    }
    /** Remove a candidate from a cell */
    removeCandidate(row, col, candidate) {
        if (this.frozen[row][col])
            return;
        this.candidates[row][col].delete(candidate);
    }
    getBoard() {
        // Return a deep copy to prevent external mutation
        return this.candidates.map(row => row.map(candidates => candidates.size === 1 ? Array.from(candidates)[0] : 0));
    }
    isFrozen(row, col) {
        return this.frozen[row][col];
    }
    setFrozen(row, col, frozen = true) {
        this.frozen[row][col] = frozen;
    }
    reset() {
        this.frozen = Array.from({ length: 9 }, () => Array(9).fill(false));
        this.candidates = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])));
    }
}
