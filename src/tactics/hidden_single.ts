/* HiddenSingle tactic converted to TypeScript
   This file is a typed source version of `tactics/hidden_single.js`.
   It intentionally keeps behavior identical and registers the class on window.HiddenSingle
   so existing runtime code continues to work (the original JS file is left in place).
*/

import BaseTactic from './base_tactic';

export interface HiddenSingleCandidate { row: number; col: number; value: number; type: string; }

interface Board {
    getHiddenSingles(): HiddenSingleCandidate[] | null | undefined;
    setValue(row: number, col: number, value: number): void;
}

export default class HiddenSingle extends BaseTactic {
    board: Board;
    extensions: any;

    constructor(board: Board, extensions: any = null) {
        super(board, extensions);
        this.board = board;
        this.extensions = extensions;
    }

    find(): { found: boolean; message: string; changes?: Array<object> } {
        const singles = this.board.getHiddenSingles();
        if (!singles || singles.length === 0) {
            return { found: false, message: 'No hidden singles' };
        }

        const result = singles[0];
        this.board.setValue(result.row, result.col, result.value);

        return {
            found: true,
            message: `Found hidden single: ${result.value} at (${result.row + 1}, ${result.col + 1}) in ${result.type}`,
            changes: [{ row: result.row, col: result.col, value: result.value, type: 'hidden-single', context: result.type }]
        };
    }
}

