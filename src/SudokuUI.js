export class SudokuUI {
    constructor(element) {
        this.board = null;
        this.activeCell = null;
        this.element = element;
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.element.addEventListener('click', this.handleCellClick.bind(this));
    }
    setBoard(board) {
        this.board = board;
        this.render();
    }
    setActiveCell(row, col) {
        var _a;
        if (!((_a = this.board) === null || _a === void 0 ? void 0 : _a.isFrozen(row, col))) {
            this.activeCell = { row, col };
            this.render();
        }
    }
    handleCellClick(e) {
        const target = e.target;
        const cell = target.closest('.sudoku-cell');
        if (!cell)
            return;
        const row = cell.dataset.row ? parseInt(cell.dataset.row, 10) : NaN;
        const col = cell.dataset.col ? parseInt(cell.dataset.col, 10) : NaN;
        if (!isNaN(row) && !isNaN(col)) {
            this.setActiveCell(row, col);
        }
    }
    handleKeyDown(e) {
        if (!this.activeCell || !this.board)
            return;
        const { row, col } = this.activeCell;
        if (this.board.isFrozen(row, col))
            return;
        if (e.key >= '1' && e.key <= '9') {
            this.board.setCandidates(row, col, [parseInt(e.key, 10)]);
            this.render();
        }
        else if (e.key === 'Backspace' || e.key === 'Delete') {
            this.board.setCandidates(row, col, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
            this.render();
        }
    }
    render() {
        this.element.innerHTML = '';
        if (!this.board)
            return;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.classList.add('sudoku-cell');
                cell.dataset.row = row.toString();
                cell.dataset.col = col.toString();
                if (this.board.isFrozen(row, col)) {
                    cell.classList.add('frozen');
                }
                if (this.activeCell && this.activeCell.row === row && this.activeCell.col === col) {
                    cell.classList.add('active');
                }
                const candidates = this.board.getCandidates(row, col);
                if (candidates.size === 1) {
                    cell.textContent = Array.from(candidates)[0].toString();
                    cell.classList.add('value-set');
                }
                else {
                    // Render only the board's candidates in a 3x3 grid
                    const candidatesGrid = document.createElement('div');
                    candidatesGrid.classList.add('candidates-grid');
                    for (let i = 1; i <= 9; i++) {
                        const candidateSpan = document.createElement('span');
                        candidateSpan.textContent = candidates.has(i) ? i.toString() : '';
                        candidatesGrid.appendChild(candidateSpan);
                    }
                    cell.appendChild(candidatesGrid);
                }
                this.element.appendChild(cell);
            }
        }
    }
}
