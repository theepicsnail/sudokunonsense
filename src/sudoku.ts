/* SudokuBoard (TypeScript)
   Conversion of `sudoku.js` with types. JS runtime remains unchanged for now.
*/

class SudokuBoard {
    board: number[][];
    initialBoard: number[][];
    candidates: Set<number>[][];
    bannedCandidates: Set<number>[][];
    solvingHistory: any[];
    currentStep: number;

    constructor() {
        this.board = Array(9).fill(null).map(() => Array(9).fill(0));
        this.initialBoard = Array(9).fill(null).map(() => Array(9).fill(0));
        this.candidates = Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set([1,2,3,4,5,6,7,8,9])));
        this.bannedCandidates = Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set<number>()));
        this.solvingHistory = [];
        this.currentStep = 0;
    }

    loadPuzzle(puzzle: number[][]) {
        this.board = puzzle.map(row => [...row]);
        this.initialBoard = puzzle.map(row => [...row]);
        this.resetCandidates();
        this.clearAllBans();
        this.solvingHistory = [];
        this.currentStep = 0;
        this.updateCandidates();
    }

    resetCandidates() {
        this.candidates = Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set([1,2,3,4,5,6,7,8,9])));
    }

    clearAllBans() {
        this.bannedCandidates = Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set<number>()));
    }

    enforceBans() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.board[r][c] !== 0) continue;
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

    removeCandidateFromPeers(row: number, col: number, value: number) {
        for (let c = 0; c < 9; c++) {
            if (c !== col) this.candidates[row][c].delete(value);
        }
        for (let r = 0; r < 9; r++) {
            if (r !== row) this.candidates[r][col].delete(value);
        }
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (r !== row || c !== col) this.candidates[r][c].delete(value);
            }
        }
    }

    banCandidate(row: number, col: number, value: number) {
        if (value < 1 || value > 9) return;
        this.bannedCandidates[row][col].add(value);
        this.candidates[row][col].delete(value);
    }

    setValue(row: number, col: number, value: number) {
        if (this.initialBoard[row][col] !== 0) return false;

        this.board[row][col] = value;
        this.candidates[row][col].clear();
        this.bannedCandidates[row][col].clear();

        if (value !== 0) this.removeCandidateFromPeers(row, col, value);
        else this.updateCandidates();

        return true;
    }

    getValue(row: number, col: number) { return this.board[row][col]; }

    getCandidates(row: number, col: number) { return Array.from(this.candidates[row][col]); }

    isValid(row: number, col: number, value: number) {
        if (value === 0) return true;
        for (let c = 0; c < 9; c++) if (c !== col && this.board[row][c] === value) return false;
        for (let r = 0; r < 9; r++) if (r !== row && this.board[r][col] === value) return false;
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if ((r !== row || c !== col) && this.board[r][c] === value) return false;
            }
        }
        return true;
    }

    isBoardValid() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] !== 0 && !this.isValid(row, col, this.board[row][col])) return false;
            }
        }
        return true;
    }

    isComplete() {
        for (let row = 0; row < 9; row++) for (let col = 0; col < 9; col++) if (this.board[row][col] === 0) return false;
        return this.isBoardValid();
    }

    getRow(row: number) { return this.board[row]; }

    getColumn(col: number) { return this.board.map(r => r[col]); }

    getBox(boxRow: number, boxCol: number) {
        const cells: { row: number; col: number; value: number }[] = [];
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
        const empty: { row: number; col: number }[] = [];
        for (let row = 0; row < 9; row++) for (let col = 0; col < 9; col++) if (this.board[row][col] === 0) empty.push({ row, col });
        return empty;
    }

    reset() {
        this.board = this.initialBoard.map(row => [...row]);
        this.clearAllBans();
        this.updateCandidates();
        this.solvingHistory = [];
        this.currentStep = 0;
    }

    toString() { return this.board.map(row => row.join(' ')).join('\n'); }

    loadFromString(str: string) {
        const lines = str.trim().split('\n');
        const puzzle: number[][] = [];
        for (let line of lines) {
            const row = line.split(/\s+/).map(cell => { const val = parseInt(cell); return isNaN(val) ? 0 : val; });
            puzzle.push(row);
        }
        this.loadPuzzle(puzzle);
    }

    loadFromCode(code: string) {
        if (typeof code !== 'string') throw new Error('Code must be a string');
        const digits = code.replace(/\s+/g, '');
        if (!/^\d{81}$/.test(digits)) throw new Error('Code must be exactly 81 digits (0-9)');
        const puzzle: number[][] = [];
        for (let r = 0; r < 9; r++) {
            const row: number[] = [];
            for (let c = 0; c < 9; c++) {
                const ch = digits[r * 9 + c];
                row.push(parseInt(ch, 10));
            }
            puzzle.push(row);
        }
        this.loadPuzzle(puzzle);
    }
}

export default SudokuBoard;
