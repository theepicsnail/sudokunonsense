import { SudokuBoard } from './SudokuBoard';

export class SudokuUI {
    private board: SudokuBoard | null = null;
    private element: HTMLElement;
    private activeCell: { row: number, col: number } | null = null;

    constructor(element: HTMLElement) {
        this.element = element;
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.element.addEventListener('click', this.handleCellClick.bind(this));
    }

    public setBoard(board: SudokuBoard) {
        this.board = board;
        this.render();
    }

    private setActiveCell(row: number, col: number) {
        if (!this.board?.isFrozen(row, col)) {
            this.activeCell = { row, col };
            this.render();
        }
    }

    private handleCellClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        const cell = target.closest('.sudoku-cell') as HTMLElement | null;
        if (!cell) return;
        const row = cell.dataset.row ? parseInt(cell.dataset.row, 10) : NaN;
        const col = cell.dataset.col ? parseInt(cell.dataset.col, 10) : NaN;
        if (!isNaN(row) && !isNaN(col)) {
            this.setActiveCell(row, col);
        }
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (!this.activeCell || !this.board) return;

        const { row, col } = this.activeCell;
        if (this.board.isFrozen(row, col)) return;

        if (e.key >= '1' && e.key <= '9') {
            this.board.setCandidates(row, col, [parseInt(e.key, 10)]);
            this.render();
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            this.board.setCandidates(row, col, [1,2,3,4,5,6,7,8,9]);
            this.render();
        }
    }

    public render() {
        this.element.innerHTML = '';
        if (!this.board) return;
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
                } else {
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
