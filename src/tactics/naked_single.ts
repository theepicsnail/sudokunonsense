/* NakedSingle tactic converted to TypeScript
   Keeps behavior identical to the JS version and registers on window.NakedSingle.
*/

import BaseTactic from './base_tactic';
import { TacticResult } from './types';

export interface NakedSingleCandidate { row: number; col: number; value: number; }

interface Board {
    setValue(row: number, col: number, value: number): void;
}

export default class NakedSingle extends BaseTactic {
    board: any; extensions: any;
    constructor(board: any, extensions: any = null) { super(board, extensions); this.board = board; this.extensions = extensions; }

    find(): TacticResult {
        const singles = getNakedSinglesFromBoard(this.board);
        if (!singles || singles.length === 0) return { found: false, message: 'No naked singles' };

        const result = singles[0];
        this.board.setValue(result.row, result.col, result.value);

        return { found: true, message: `Found naked single: ${result.value} at (${result.row + 1}, ${result.col + 1})`, changes: [{ row: result.row, col: result.col, value: result.value, type: 'naked-single' }] };
    }
}

// Helper: compute naked singles from a board instance (moved from sudoku.ts)
export function getNakedSinglesFromBoard(board: any): Array<{ row: number; col: number; value: number }> {
    const singles: { row: number; col: number; value: number }[] = [];
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board.board[row][col] === 0 && board.candidates[row][col].size === 1) {
                singles.push({ row, col, value: Number(Array.from(board.candidates[row][col])[0]) });
            }
        }
    }
    return singles;
}
