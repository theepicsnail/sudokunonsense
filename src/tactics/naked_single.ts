/* NakedSingle tactic converted to TypeScript
   Keeps behavior identical to the JS version and registers on window.NakedSingle.
*/

import BaseTactic from './base_tactic';
import { TacticResult } from './types';

export interface NakedSingleCandidate { row: number; col: number; value: number; }

interface Board {
    getNakedSingles(): NakedSingleCandidate[] | null | undefined;
    setValue(row: number, col: number, value: number): void;
}

export default class NakedSingle extends BaseTactic {
    board: any; extensions: any;
    constructor(board: any, extensions: any = null) { super(board, extensions); this.board = board; this.extensions = extensions; }

    find(): TacticResult {
        const singles = this.board.getNakedSingles();
        if (!singles || singles.length === 0) return { found: false, message: 'No naked singles' };

        const result = singles[0];
        this.board.setValue(result.row, result.col, result.value);

    return { found: true, message: `Found naked single: ${result.value} at (${result.row + 1}, ${result.col + 1})`, changes: [{ row: result.row, col: result.col, value: result.value, type: 'naked-single' }] };
    }
}
