/* SudokuBoard (TypeScript)
   Conversion of `sudoku.js` with types. JS runtime remains unchanged for now.
*/
class SudokuBoard {
    constructor() {
        this.board = Array(9).fill(null).map(() => Array(9).fill(0));
        this.initialBoard = Array(9).fill(null).map(() => Array(9).fill(0));
        this.candidates = Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])));
        this.bannedCandidates = Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set()));
        this.solvingHistory = [];
        this.currentStep = 0;
    }
    loadPuzzle(puzzle) {
        this.board = puzzle.map(row => [...row]);
        this.initialBoard = puzzle.map(row => [...row]);
        this.resetCandidates();
        this.clearAllBans();
        this.solvingHistory = [];
        this.currentStep = 0;
        this.updateCandidates();
    }
    resetCandidates() {
        this.candidates = Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])));
    }
    clearAllBans() {
        this.bannedCandidates = Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set()));
    }
    enforceBans() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.board[r][c] !== 0)
                    continue;
                for (const val of this.bannedCandidates[r][c]) {
                    this.candidates[r][c].delete(val);
                }
            }
        }
    }
    updateCandidates() {
        this.resetCandidates();
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] !== 0) {
                    this.candidates[row][col].clear();
                    this.removeCandidateFromPeers(row, col, this.board[row][col]);
                }
            }
        }
        this.enforceBans();
    }
    removeCandidateFromPeers(row, col, value) {
        for (let c = 0; c < 9; c++) {
            if (c !== col)
                this.candidates[row][c].delete(value);
        }
        for (let r = 0; r < 9; r++) {
            if (r !== row)
                this.candidates[r][col].delete(value);
        }
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (r !== row || c !== col)
                    this.candidates[r][c].delete(value);
            }
        }
    }
    banCandidate(row, col, value) {
        if (value < 1 || value > 9)
            return;
        this.bannedCandidates[row][col].add(value);
        this.candidates[row][col].delete(value);
    }
    setValue(row, col, value) {
        if (this.initialBoard[row][col] !== 0)
            return false;
        this.board[row][col] = value;
        this.candidates[row][col].clear();
        this.bannedCandidates[row][col].clear();
        if (value !== 0)
            this.removeCandidateFromPeers(row, col, value);
        else
            this.updateCandidates();
        return true;
    }
    getValue(row, col) { return this.board[row][col]; }
    getCandidates(row, col) { return Array.from(this.candidates[row][col]); }
    isValid(row, col, value) {
        if (value === 0)
            return true;
        for (let c = 0; c < 9; c++)
            if (c !== col && this.board[row][c] === value)
                return false;
        for (let r = 0; r < 9; r++)
            if (r !== row && this.board[r][col] === value)
                return false;
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if ((r !== row || c !== col) && this.board[r][c] === value)
                    return false;
            }
        }
        return true;
    }
    isBoardValid() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] !== 0 && !this.isValid(row, col, this.board[row][col]))
                    return false;
            }
        }
        return true;
    }
    isComplete() {
        for (let row = 0; row < 9; row++)
            for (let col = 0; col < 9; col++)
                if (this.board[row][col] === 0)
                    return false;
        return this.isBoardValid();
    }
    getRow(row) { return this.board[row]; }
    getColumn(col) { return this.board.map(r => r[col]); }
    getBox(boxRow, boxCol) {
        const cells = [];
        const startRow = boxRow * 3;
        const startCol = boxCol * 3;
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                cells.push({ row: r, col: c, value: this.board[r][c] });
            }
        }
        return cells;
    }
    getEmptyCells() {
        const empty = [];
        for (let row = 0; row < 9; row++)
            for (let col = 0; col < 9; col++)
                if (this.board[row][col] === 0)
                    empty.push({ row, col });
        return empty;
    }
    getNakedSingles() {
        const singles = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0 && this.candidates[row][col].size === 1) {
                    singles.push({ row, col, value: Array.from(this.candidates[row][col])[0] });
                }
            }
        }
        return singles;
    }
    getHiddenSingles() {
        const singles = [];
        for (let row = 0; row < 9; row++) {
            const candidates = this.getRowCandidates(row);
            for (let value = 1; value <= 9; value++) {
                if (candidates[value].length === 1) {
                    singles.push({ row, col: candidates[value][0], value, type: 'row' });
                }
            }
        }
        for (let col = 0; col < 9; col++) {
            const candidates = this.getColumnCandidates(col);
            for (let value = 1; value <= 9; value++) {
                if (candidates[value].length === 1) {
                    singles.push({ row: candidates[value][0], col, value, type: 'column' });
                }
            }
        }
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const candidates = this.getBoxCandidates(boxRow, boxCol);
                for (let value = 1; value <= 9; value++) {
                    if (candidates[value].length === 1) {
                        const pos = candidates[value][0];
                        singles.push({ row: pos.row, col: pos.col, value, type: 'box' });
                    }
                }
            }
        }
        return singles;
    }
    getRowCandidates(row) {
        const candidates = {};
        for (let value = 1; value <= 9; value++)
            candidates[value] = [];
        for (let col = 0; col < 9; col++) {
            if (this.board[row][col] === 0) {
                for (const value of this.candidates[row][col])
                    candidates[value].push(col);
            }
        }
        return candidates;
    }
    getColumnCandidates(col) {
        const candidates = {};
        for (let value = 1; value <= 9; value++)
            candidates[value] = [];
        for (let row = 0; row < 9; row++) {
            if (this.board[row][col] === 0) {
                for (const value of this.candidates[row][col])
                    candidates[value].push(row);
            }
        }
        return candidates;
    }
    getBoxCandidates(boxRow, boxCol) {
        const candidates = {};
        for (let value = 1; value <= 9; value++)
            candidates[value] = [];
        const startRow = boxRow * 3;
        const startCol = boxCol * 3;
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (this.board[r][c] === 0) {
                    for (const value of this.candidates[r][c])
                        candidates[value].push({ row: r, col: c });
                }
            }
        }
        return candidates;
    }
    reset() {
        this.board = this.initialBoard.map(row => [...row]);
        this.clearAllBans();
        this.updateCandidates();
        this.solvingHistory = [];
        this.currentStep = 0;
    }
    toString() { return this.board.map(row => row.join(' ')).join('\n'); }
    loadFromString(str) {
        const lines = str.trim().split('\n');
        const puzzle = [];
        for (let line of lines) {
            const row = line.split(/\s+/).map(cell => { const val = parseInt(cell); return isNaN(val) ? 0 : val; });
            puzzle.push(row);
        }
        this.loadPuzzle(puzzle);
    }
    loadFromCode(code) {
        if (typeof code !== 'string')
            throw new Error('Code must be a string');
        const digits = code.replace(/\s+/g, '');
        if (!/^\d{81}$/.test(digits))
            throw new Error('Code must be exactly 81 digits (0-9)');
        const puzzle = [];
        for (let r = 0; r < 9; r++) {
            const row = [];
            for (let c = 0; c < 9; c++) {
                const ch = digits[r * 9 + c];
                row.push(parseInt(ch, 10));
            }
            puzzle.push(row);
        }
        this.loadPuzzle(puzzle);
    }
    getExamplePuzzle() {
        return [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ];
    }
}
export default SudokuBoard;
