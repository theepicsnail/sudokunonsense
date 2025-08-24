class SudokuBoard {
    constructor() {
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.initialBoard = Array(9).fill().map(() => Array(9).fill(0));
        this.candidates = Array(9).fill().map(() =>
            Array(9).fill().map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]))
        );
        // Persistent candidate bans (manual eliminations)
        this.bannedCandidates = Array(9).fill().map(() =>
            Array(9).fill().map(() => new Set())
        );
        this.solvingHistory = [];
        this.currentStep = 0;
    }

    // Initialize the board with a puzzle
    loadPuzzle(puzzle) {
        this.board = puzzle.map(row => [...row]);
        this.initialBoard = puzzle.map(row => [...row]);
        this.resetCandidates();
        this.clearAllBans();
        this.solvingHistory = [];
        this.currentStep = 0;
        this.updateCandidates();
    }

    // Reset candidates based on current board state
    resetCandidates() {
        this.candidates = Array(9).fill().map(() =>
            Array(9).fill().map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]))
        );
    }

    // Remove bans
    clearAllBans() {
        this.bannedCandidates = Array(9).fill().map(() =>
            Array(9).fill().map(() => new Set())
        );
    }

    // Apply bans to current candidates
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

    // Update candidates based on current board state
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
        // Re-apply persistent bans
        this.enforceBans();
    }

    // Remove a candidate from all peers of a cell
    removeCandidateFromPeers(row, col, value) {
        // Remove from row
        for (let c = 0; c < 9; c++) {
            if (c !== col) {
                this.candidates[row][c].delete(value);
            }
        }

        // Remove from column
        for (let r = 0; r < 9; r++) {
            if (r !== row) {
                this.candidates[r][col].delete(value);
            }
        }

        // Remove from 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (r !== row || c !== col) {
                    this.candidates[r][c].delete(value);
                }
            }
        }
    }

    // Persistently ban a candidate in a cell
    banCandidate(row, col, value) {
        if (value < 1 || value > 9) return;
        this.bannedCandidates[row][col].add(value);
        this.candidates[row][col].delete(value);
    }

    // Set a value in a cell
    setValue(row, col, value) {
        if (this.initialBoard[row][col] !== 0) {
            return false; // Cannot modify initial values
        }

        this.board[row][col] = value;
        this.candidates[row][col].clear();
        // Clear bans for this cell when a value is set/cleared
        this.bannedCandidates[row][col].clear();

        if (value !== 0) {
            this.removeCandidateFromPeers(row, col, value);
        } else {
            this.updateCandidates();
        }

        return true;
    }

    // Get value at position
    getValue(row, col) {
        return this.board[row][col];
    }

    // Get candidates at position
    getCandidates(row, col) {
        return Array.from(this.candidates[row][col]);
    }

    // Check if a value is valid at a position
    isValid(row, col, value) {
        if (value === 0) return true;

        // Check row
        for (let c = 0; c < 9; c++) {
            if (c !== col && this.board[row][c] === value) {
                return false;
            }
        }

        // Check column
        for (let r = 0; r < 9; r++) {
            if (r !== row && this.board[r][col] === value) {
                return false;
            }
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if ((r !== row || c !== col) && this.board[r][c] === value) {
                    return false;
                }
            }
        }

        return true;
    }

    // Check if the entire board is valid
    isBoardValid() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] !== 0 && !this.isValid(row, col, this.board[row][col])) {
                    return false;
                }
            }
        }
        return true;
    }

    // Check if the board is complete
    isComplete() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
            }
        }
        return this.isBoardValid();
    }

    // Get all cells in a row
    getRow(row) {
        return this.board[row];
    }

    // Get all cells in a column
    getColumn(col) {
        return this.board.map(row => row[col]);
    }

    // Get all cells in a 3x3 box
    getBox(boxRow, boxCol) {
        const cells = [];
        const startRow = boxRow * 3;
        const startCol = boxCol * 3;

        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                cells.push({
                    row: r,
                    col: c,
                    value: this.board[r][c]
                });
            }
        }

        return cells;
    }

    // Get all empty cells
    getEmptyCells() {
        const empty = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) {
                    empty.push({ row, col });
                }
            }
        }
        return empty;
    }

    // Get cells with only one candidate (naked singles)
    getNakedSingles() {
        const singles = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0 && this.candidates[row][col].size === 1) {
                    singles.push({
                        row,
                        col,
                        value: Array.from(this.candidates[row][col])[0]
                    });
                }
            }
        }
        return singles;
    }

    // Get hidden singles in rows, columns, and boxes
    getHiddenSingles() {
        const singles = [];

        // Check rows
        for (let row = 0; row < 9; row++) {
            const candidates = this.getRowCandidates(row);
            for (let value = 1; value <= 9; value++) {
                if (candidates[value].length === 1) {
                    singles.push({
                        row,
                        col: candidates[value][0],
                        value,
                        type: 'row'
                    });
                }
            }
        }

        // Check columns
        for (let col = 0; col < 9; col++) {
            const candidates = this.getColumnCandidates(col);
            for (let value = 1; value <= 9; value++) {
                if (candidates[value].length === 1) {
                    singles.push({
                        row: candidates[value][0],
                        col,
                        value,
                        type: 'column'
                    });
                }
            }
        }

        // Check boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const candidates = this.getBoxCandidates(boxRow, boxCol);
                for (let value = 1; value <= 9; value++) {
                    if (candidates[value].length === 1) {
                        const pos = candidates[value][0];
                        singles.push({
                            row: pos.row,
                            col: pos.col,
                            value,
                            type: 'box'
                        });
                    }
                }
            }
        }

        return singles;
    }

    // Helper methods for hidden singles
    getRowCandidates(row) {
        const candidates = {};
        for (let value = 1; value <= 9; value++) {
            candidates[value] = [];
        }

        for (let col = 0; col < 9; col++) {
            if (this.board[row][col] === 0) {
                for (let value of this.candidates[row][col]) {
                    candidates[value].push(col);
                }
            }
        }

        return candidates;
    }

    getColumnCandidates(col) {
        const candidates = {};
        for (let value = 1; value <= 9; value++) {
            candidates[value] = [];
        }

        for (let row = 0; row < 9; row++) {
            if (this.board[row][col] === 0) {
                for (let value of this.candidates[row][col]) {
                    candidates[value].push(row);
                }
            }
        }

        return candidates;
    }

    getBoxCandidates(boxRow, boxCol) {
        const candidates = {};
        for (let value = 1; value <= 9; value++) {
            candidates[value] = [];
        }

        const startRow = boxRow * 3;
        const startCol = boxCol * 3;

        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (this.board[r][c] === 0) {
                    for (let value of this.candidates[r][c]) {
                        candidates[value].push({ row: r, col: c });
                    }
                }
            }
        }

        return candidates;
    }

    // Reset to initial state
    reset() {
        this.board = this.initialBoard.map(row => [...row]);
        this.clearAllBans();
        this.updateCandidates();
        this.solvingHistory = [];
        this.currentStep = 0;
    }

    // Get board as string for display
    toString() {
        return this.board.map(row => row.join(' ')).join('\n');
    }

    // Load from string format
    loadFromString(str) {
        const lines = str.trim().split('\n');
        const puzzle = [];

        for (let line of lines) {
            const row = line.split(/\s+/).map(cell => {
                const val = parseInt(cell);
                return isNaN(val) ? 0 : val;
            });
            puzzle.push(row);
        }

        this.loadPuzzle(puzzle);
    }

    // Load from 81-digit code, reading order left->right, top->bottom (0 as empty)
    loadFromCode(code) {
        if (typeof code !== 'string') throw new Error('Code must be a string');
        const digits = code.replace(/\s+/g, ''); // allow accidental spaces
        if (!/^\d{81}$/.test(digits)) throw new Error('Code must be exactly 81 digits (0-9)');
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

    // Get example puzzle
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
