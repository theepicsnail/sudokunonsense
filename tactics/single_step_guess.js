(function () {
    const Base = window.BaseTactic;

    class SingleStepGuess extends Base {
        find() {
            const useExtensions = !!this.extensions;
            const exported = useExtensions && this.extensions.exportState ? this.extensions.exportState() : null;

            const emptyCells = this.board.getEmptyCells();
            for (const { row, col } of emptyCells) {
                const cands = this.board.getCandidates(row, col);
                for (const candidate of cands) {
                    const cloned = this.cloneBoard(this.board);
                    cloned.setValue(row, col, candidate);
                    if (useExtensions && this.extensions && this.extensions.importState) {
                        try { this.extensions.importState(exported); } catch (e) { /* ignore */ }
                    }

                    if (cloned.updateCandidates) cloned.updateCandidates();
                    const contradiction = this.detectImmediateContradiction(cloned);
                    if (contradiction) {
                        // Eliminate candidate on real board
                        if (this.board.removeCandidate) this.board.removeCandidate(row, col, candidate);
                        return { found: true, message: `Eliminated candidate ${candidate} at (${row + 1}, ${col + 1}) by contradiction`, changes: [{ row, col, removed: [candidate], type: 'single-step-guess' }] };
                    }
                }
            }

            return { found: false, message: 'No contradiction-based eliminations found' };
        }

        cloneBoard(sourceBoard) {
            // Attempt a shallow clone that keeps methods from the same constructor
            try {
                const b = new sourceBoard.constructor();
                b.board = sourceBoard.board.map(r => Array.isArray(r) ? [...r] : r);
                b.initialBoard = (sourceBoard.initialBoard || []).map(r => Array.isArray(r) ? [...r] : r);
                if (b.updateCandidates) b.updateCandidates();
                return b;
            } catch (e) {
                // Fallback: shallow object clone
                return JSON.parse(JSON.stringify(sourceBoard));
            }
        }

        detectImmediateContradiction(testBoard) {
            // 1) any empty cell with zero candidates
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (!testBoard.getValue(r, c) && testBoard.getCandidates(r, c).length === 0) return { type: 'empty-cell', row: r, col: c };
                }
            }

            // 2) unit-level impossibility
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

    window.SingleStepGuess = SingleStepGuess;
})();
