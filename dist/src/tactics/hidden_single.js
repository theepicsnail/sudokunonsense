/* HiddenSingle tactic converted to TypeScript
   This file is a typed source version of `tactics/hidden_single.js`.
   It intentionally keeps behavior identical and registers the class on window.HiddenSingle
   so existing runtime code continues to work (the original JS file is left in place).
*/
import BaseTactic from './base_tactic';
export default class HiddenSingle extends BaseTactic {
    constructor(board, extensions = null) {
        super(board, extensions);
        this.board = board;
        this.extensions = extensions;
    }
    find() {
        const singles = getHiddenSinglesFromBoard(this.board);
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
// Helper: compute hidden singles from a board instance (moved from sudoku.ts)
export function getHiddenSinglesFromBoard(board) {
    const singles = [];
    for (let row = 0; row < 9; row++) {
        const candidates = getRowCandidates(board, row);
        for (let value = 1; value <= 9; value++) {
            if ((candidates[value] || []).length === 1) {
                singles.push({ row, col: (candidates[value] || [0])[0], value, type: 'row' });
            }
        }
    }
    for (let col = 0; col < 9; col++) {
        const candidates = getColumnCandidates(board, col);
        for (let value = 1; value <= 9; value++) {
            if ((candidates[value] || []).length === 1) {
                singles.push({ row: (candidates[value] || [0])[0], col, value, type: 'column' });
            }
        }
    }
    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
            const candidates = getBoxCandidates(board, boxRow, boxCol);
            for (let value = 1; value <= 9; value++) {
                if ((candidates[value] || []).length === 1) {
                    const pos = (candidates[value] || [{ row: 0, col: 0 }])[0];
                    singles.push({ row: pos.row, col: pos.col, value, type: 'box' });
                }
            }
        }
    }
    return singles;
}
// Candidate helpers moved here so tactics can compute candidates without relying on
// board instance methods. They read the board.candidates data structure directly.
export function getRowCandidates(board, row) {
    const candidates = {};
    for (let value = 1; value <= 9; value++)
        candidates[value] = [];
    for (let col = 0; col < 9; col++) {
        if (board.board[row][col] === 0) {
            for (const value of board.getCandidates ? board.getCandidates(row, col) : board.candidates[row][col])
                candidates[value].push(col);
        }
    }
    return candidates;
}
export function getColumnCandidates(board, col) {
    const candidates = {};
    for (let value = 1; value <= 9; value++)
        candidates[value] = [];
    for (let row = 0; row < 9; row++) {
        if (board.board[row][col] === 0) {
            for (const value of board.getCandidates ? board.getCandidates(row, col) : board.candidates[row][col])
                candidates[value].push(row);
        }
    }
    return candidates;
}
export function getBoxCandidates(board, boxRow, boxCol) {
    const candidates = {};
    for (let value = 1; value <= 9; value++)
        candidates[value] = [];
    const startRow = boxRow * 3;
    const startCol = boxCol * 3;
    for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
            if (board.board[r][c] === 0) {
                for (const value of board.getCandidates ? board.getCandidates(r, c) : board.candidates[r][c])
                    candidates[value].push({ row: r, col: c });
            }
        }
    }
    return candidates;
}
