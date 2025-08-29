export class SudokuSolver {
    constructor(board, rules) {
        this.board = board;
        this.rules = rules;
    }
    /**
     * Applies the first rule that produces a change, updates the board, and returns the change.
     * Returns undefined if no rule can make a change.
     */
    step() {
        for (const rule of this.rules) {
            const change = rule.apply(this.board);
            if (change.changed) {
                if ('removeCandidate' in change) {
                    const { row, col, value } = change.removeCandidate;
                    this.board.removeCandidate(row, col, value);
                }
                return change;
            }
        }
        return { changed: false };
    }
}
