/* SingleStepGuess tactic converted to TypeScript
   Behavior mirrors the existing JS version. Registered on window.SingleStepGuess.
*/

import BaseTactic from './base_tactic';

interface BoardLike {
    getEmptyCells(): Array<{ row: number; col: number }>;
    getCandidates(row: number, col: number): number[];
    setValue(row: number, col: number, value: number): void;
    removeCandidate?(row: number, col: number, candidate: number): void;
    updateCandidates?(): void;
    getValue(row: number, col: number): number;
    rowHasValue?(r: number, d: number): boolean;
    countCandidatePlacesInRow?(r: number, d: number): number;
    colHasValue?(c: number, d: number): boolean;
    countCandidatePlacesInCol?(c: number, d: number): number;
    boxHasValue?(br: number, bc: number, d: number): boolean;
    countCandidatePlacesInBox?(br: number, bc: number, d: number): number;
}

export default class SingleStepGuess extends BaseTactic {
    board: BoardLike; extensions: any;

    constructor(board: BoardLike, extensions: any = null) { super(board, extensions); this.board = board; this.extensions = extensions; }

    find(): { found: boolean; message: string; changes?: Array<object> } {
            const useExtensions = !!this.extensions;
            const exported = useExtensions && this.extensions.exportState ? this.extensions.exportState() : null;

            const emptyCells = this.board.getEmptyCells();
            for (const { row, col } of emptyCells) {
                const cands = this.board.getCandidates(row, col);
                for (const candidate of cands) {
                    const cloned = this.cloneBoard(this.board as any);
                    cloned.setValue(row, col, candidate);
                    if (useExtensions && this.extensions && this.extensions.importState) {
                        try { this.extensions.importState(exported); } catch (e) { /* ignore */ }
                    }

                    if (cloned.updateCandidates) cloned.updateCandidates();
                    const contradiction = this.detectImmediateContradiction(cloned as any);
                    if (contradiction) {
                        if (this.board.removeCandidate) this.board.removeCandidate(row, col, candidate);
                        return { found: true, message: `Eliminated candidate ${candidate} at (${row + 1}, ${col + 1}) by contradiction`, changes: [{ row, col, removed: [candidate], type: 'single-step-guess' }] };
                    }
                }
            }

            return { found: false, message: 'No contradiction-based eliminations found' };
        }

        cloneBoard(sourceBoard: any): any {
            try {
                const b = new sourceBoard.constructor();
                b.board = sourceBoard.board.map((r: any) => Array.isArray(r) ? [...r] : r);
                b.initialBoard = (sourceBoard.initialBoard || []).map((r: any) => Array.isArray(r) ? [...r] : r);
                if (b.updateCandidates) b.updateCandidates();
                return b;
            } catch (e) {
                return JSON.parse(JSON.stringify(sourceBoard));
            }
        }

        detectImmediateContradiction(testBoard: any): any {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (!testBoard.getValue(r, c) && testBoard.getCandidates(r, c).length === 0) return { type: 'empty-cell', row: r, col: c };
                }
            }

            for (let r = 0; r < 9; r++) {
                for (let d = 1; d <= 9; d++) {
                    if (!testBoard.rowHasValue(r, d) && testBoard.countCandidatePlacesInRow(r, d) === 0) return { type: 'row-no-place', row: r, digit: d };
                }
            }

            for (let c = 0; c < 9; c++) {
                for (let d = 1; d <= 9; d++) {
                    if (!testBoard.colHasValue(c, d) && testBoard.countCandidatePlacesInCol(c, d) === 0) return { type: 'col-no-place', col: c, digit: d };
                }
            }

            for (let br = 0; br < 3; br++) {
                for (let bc = 0; bc < 3; bc++) {
                    for (let d = 1; d <= 9; d++) {
                        if (!testBoard.boxHasValue(br, bc, d) && testBoard.countCandidatePlacesInBox(br, bc, d) === 0) return { type: 'box-no-place', boxRow: br, boxCol: bc, digit: d };
                    }
                }
            }

            return null;
        }
    }

export {};
