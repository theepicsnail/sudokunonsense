class SudokuApp {
    constructor() {
        this.board = new SudokuBoard();
        this.tactics = new SudokuTactics(this.board);
        this.extensions = new SudokuExtensions(this.board);
        this.tactics.setExtensions(this.extensions);
        this.solvingHistory = [];
        this.currentStep = 0;
        this.autoSolving = false;
        this.autoSolveInterval = null;
        this.lastConflictKeys = new Set();
        this.lastNoCandKeys = new Set();
        this.autoTacticOrder = [
            'naked-single',
            'hidden-single',
            'pointing-pair',
            'box-line-reduction',
            'naked-pair',
            'hidden-pair',
            'x-wing',
            'swordfish',
            'xy-wing',
            'xyz-wing',
            'single-step-guess'
        ];
        
        this.initializeUI();
        this.bindEvents();
        this.loadExamplePuzzle();
    }

    initializeUI() {
        this.puzzleGrid = document.getElementById('puzzleGrid');
        this.tacticSelect = document.getElementById('tacticSelect');
        this.tacticDescription = document.getElementById('tacticDescription');
        this.solvingLog = document.getElementById('solvingLog');
        this.extensionInfo = document.getElementById('extensionInfo');
        
        this.createSudokuGrid();
        this.updateTacticDescription();
        this.updateExtensionInfo();
    }

    createSudokuGrid() {
        this.puzzleGrid.innerHTML = '';
        this.cells = [];
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'cell-input';
                input.maxLength = 1;
                input.inputMode = 'numeric';

                const candidates = document.createElement('div');
                candidates.className = 'candidates';
                for (let n = 1; n <= 9; n++) {
                    const span = document.createElement('div');
                    span.className = 'candidate';
                    candidates.appendChild(span);
                }

                if (col === 2 || col === 5) { cell.style.borderRight = '2px solid #333'; }
                if (row === 2 || row === 5) { cell.style.borderBottom = '2px solid #333'; }

                cell.appendChild(input);
                cell.appendChild(candidates);
                this.puzzleGrid.appendChild(cell);
                this.cells.push(cell);

                input.addEventListener('input', (e) => this.handleCellInput(e, row, col));
                input.addEventListener('keydown', (e) => this.handleCellKeydown(e, row, col));
                input.addEventListener('focus', () => this.handleCellFocus(row, col));
                input.addEventListener('blur', () => this.handleCellBlur(row, col));
            }
        }
    }

    bindEvents() {
        document.getElementById('clearBtn').addEventListener('click', () => this.clearBoard());
        document.getElementById('loadExampleBtn').addEventListener('click', () => this.loadExamplePuzzle());
        document.getElementById('validateBtn').addEventListener('click', () => this.validateBoard());
        document.getElementById('stepBtn').addEventListener('click', () => this.executeStep());
        document.getElementById('autoSolveBtn').addEventListener('click', () => this.toggleAutoSolve());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetBoard());
        this.tacticSelect.addEventListener('change', () => this.updateTacticDescription());
        document.getElementById('addThermoBtn').addEventListener('click', () => this.addThermoSudoku());
        document.getElementById('addKnightBtn').addEventListener('click', () => this.addKnightsMove());
        document.getElementById('addKingBtn').addEventListener('click', () => this.addKingsMove());
        document.getElementById('addBoxSumNeighborBtn').addEventListener('click', () => this.addBoxSumNeighbor());
        document.getElementById('clearExtensionsBtn').addEventListener('click', () => this.clearExtensions());
        // Load code button
        document.getElementById('loadCodeBtn').addEventListener('click', () => this.loadFromCodeInput());
    }

    handleCellInput(event, row, col) {
        const raw = event.target.value.replace(/[^1-9]/g, '');
        event.target.value = raw;
        const val = raw === '' ? 0 : parseInt(raw, 10);

        if (val !== 0 && this.extensions.getActiveExtensions().length > 0) {
            if (!this.extensions.validateMove(row, col, val)) {
                event.target.value = '';
                this.logMessage('Move violates constraints', 'error');
                return;
            }
        }

        this.board.setValue(row, col, val);
        this.updateCellDisplay(row, col);
        this.updateCandidates();
    }

    handleCellKeydown(event, row, col) {
        if (event.key === 'Backspace' || event.key === 'Delete') {
            this.board.setValue(row, col, 0);
            this.updateCellDisplay(row, col);
            this.updateCandidates();
        }
    }

    handleCellFocus(row, col) { this.highlightRelatedCells(row, col); }
    handleCellBlur(row, col) { this.clearHighlights(); }

    highlightRelatedCells(row, col) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = this.getCellElement(r, c);
                if (r === row || c === col || (Math.floor(r / 3) === Math.floor(row / 3) && Math.floor(c / 3) === Math.floor(col / 3))) {
                    cell.classList.add('highlighted');
                }
            }
        }
    }

    clearHighlights() { this.cells.forEach(cell => cell.classList.remove('highlighted')); }

    getCellElement(row, col) { return this.cells[row * 9 + col]; }

    updateCellDisplay(row, col) {
        const cell = this.getCellElement(row, col);
        const input = cell.querySelector('.cell-input');
        const value = this.board.getValue(row, col);
        const isInitial = this.board.initialBoard[row][col] !== 0;

        input.value = value || '';
        input.readOnly = isInitial && value !== 0;

        cell.classList.remove('initial', 'solved', 'has-value', 'conflict', 'nocands');
        if (isInitial) cell.classList.add('initial');
        if (value !== 0) { cell.classList.add('solved', 'has-value'); }

        this.renderCandidatesForCell(row, col);
    }

    updateBoardDisplay() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                this.updateCellDisplay(row, col);
            }
        }
    }

    updateCandidates() {
        this.board.updateCandidates();
        if (this.extensions.getActiveExtensions().length > 0) {
            this.extensions.updateCandidatesWithExtensions();
        }
        this.renderAllCandidates();
        this.checkConflicts();
    }

    renderAllCandidates() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                this.renderCandidatesForCell(row, col);
            }
        }
    }

    renderCandidatesForCell(row, col) {
        const cell = this.getCellElement(row, col);
        const overlay = cell.querySelector('.candidates');
        const value = this.board.getValue(row, col);
        const spans = overlay.children;

        if (value !== 0) {
            for (let i = 0; i < 9; i++) spans[i].textContent = '';
            return;
        }

        const candidates = this.board.getCandidates(row, col);
        for (let n = 1; n <= 9; n++) {
            const idx = n - 1;
            spans[idx].textContent = candidates.includes(n) ? String(n) : '';
        }
    }

    clearBoard() {
        this.board = new SudokuBoard();
        this.tactics = new SudokuTactics(this.board);
        this.extensions = new SudokuExtensions(this.board);
        this.tactics.setExtensions(this.extensions);
        this.solvingHistory = [];
        this.currentStep = 0;
        this.lastConflictKeys.clear();
        this.lastNoCandKeys.clear();
        this.updateBoardDisplay();
        this.clearHighlights();
        this.logMessage('Board cleared', 'info');
    }

    loadExamplePuzzle() {
        const examplePuzzle = this.board.getExamplePuzzle();
        this.board.loadPuzzle(examplePuzzle);
        this.updateBoardDisplay();
        this.updateCandidates();
        this.logMessage('Example puzzle loaded', 'success');
    }

    validateBoard() {
        if (this.board.isBoardValid()) {
            if (this.board.isComplete()) {
                this.logMessage('Puzzle is complete and valid!', 'success');
            } else {
                this.logMessage('Puzzle is valid but incomplete', 'warning');
            }
        } else {
            this.logMessage('Puzzle has errors', 'error');
        }
    }

    executeStep() {
        const selectedTactic = this.tacticSelect.value;
        const result = this.tactics.executeTactic(selectedTactic);
        
        if (result.found) {
            this.solvingHistory.push({ tactic: selectedTactic, result, timestamp: new Date() });

            // Update fixed values on the grid first
            this.updateBoardDisplay();
            // Recompute baseline candidates from values
            this.board.updateCandidates();
            if (this.extensions.getActiveExtensions().length > 0) {
                this.extensions.updateCandidatesWithExtensions();
            }
            // Re-apply any eliminations produced by the tactic result so they persist
            if (result.changes) this.applyCandidateEliminations(result.changes);

            // Re-render candidates and checks
            this.renderAllCandidates();
            this.checkConflicts();

            this.logMessage(result.message, 'success');
            if (result.changes) { this.highlightChanges(result.changes); }
            if (this.board.isComplete()) { this.logMessage('Puzzle solved!', 'success'); this.stopAutoSolve(); }
        } else {
            this.logMessage(result.message, 'warning');
        }
    }

    applyCandidateEliminations(changes) {
        let any = false;
        const toArray = (val) => Array.isArray(val) ? val : (val != null ? [val] : []);
        changes.forEach(change => {
            const { row, col } = change;
            // Accept different shapes: {removed:[...]}, {value: n}, {values:[...]}
            const removed = new Set([
                ...toArray(change.removed),
                ...toArray(change.value),
                ...toArray(change.values)
            ].filter(v => typeof v === 'number'));
            if (removed.size === 0) return;
            if (this.board.getValue(row, col) !== 0) return;
            removed.forEach(val => {
                this.board.banCandidate(row, col, val);
                any = true;
            });
        });
        if (any) {
            if (this.extensions.getActiveExtensions().length > 0) {
                this.extensions.updateCandidatesWithExtensions();
            }
            this.renderAllCandidates();
        }
        return any;
    }

    highlightChanges(changes) {
        this.clearHighlights();
        changes.forEach(change => {
            const cell = this.getCellElement(change.row, change.col);
            cell.classList.add('highlighted');
            setTimeout(() => cell.classList.remove('highlighted'), 2000);
        });
    }

    toggleAutoSolve() { this.autoSolving ? this.stopAutoSolve() : this.startAutoSolve(); }

    startAutoSolve() {
        this.autoSolving = true;
        const btn = document.getElementById('autoSolveBtn');
        btn.textContent = 'Stop Auto Solve';
        btn.classList.remove('btn-success');
        btn.classList.add('btn-warning');
        this.autoSolveInterval = setInterval(() => {
            this.runAutoStep();
        }, 600);
    }

    runAutoStep() {
        // Keep trying tactics in priority order; treat only real effects as progress
        for (const tactic of this.autoTacticOrder) {
            const beforeBoard = JSON.stringify(this.board.board);
            const result = this.tactics.executeTactic(tactic);

            // If the tactic reported nothing, try next
            if (!result || !result.found) continue;

            // Sync UI/state after tactic mutation
            const afterBoard = JSON.stringify(this.board.board);
            const boardChanged = beforeBoard !== afterBoard;

            // Recompute candidates from values (some tactics set values)
            if (boardChanged) {
                this.updateCandidates();
            }

            // Apply eliminations returned by the tactic. Capture whether any were applied
            let appliedElims = false;
            if (result.changes) {
                appliedElims = this.applyCandidateEliminations(result.changes);
            }

            // If nothing changed (no values and no eliminations), continue to next tactic
            if (!boardChanged && !appliedElims) {
                continue;
            }

            // Record and render
            this.solvingHistory.push({ tactic, result, timestamp: new Date() });
            this.updateBoardDisplay();
            this.renderAllCandidates();
            this.checkConflicts();
            this.logMessage(result.message, 'success');
            if (result.changes) this.highlightChanges(result.changes);
            if (this.board.isComplete()) {
                this.logMessage('Puzzle solved!', 'success');
                this.stopAutoSolve();
            }
            return true;
        }
        // No tactic had any effect this pass
        this.logMessage('No tactic made progress. Auto-solve paused.', 'warning');
        this.stopAutoSolve();
        return false;
    }

    stopAutoSolve() {
        this.autoSolving = false;
        const btn = document.getElementById('autoSolveBtn');
        btn.textContent = 'Auto Solve';
        btn.classList.remove('btn-warning');
        btn.classList.add('btn-success');
        if (this.autoSolveInterval) { clearInterval(this.autoSolveInterval); this.autoSolveInterval = null; }
    }

    resetBoard() {
        this.board.reset();
        this.solvingHistory = [];
        this.currentStep = 0;
        this.lastConflictKeys.clear();
        this.lastNoCandKeys.clear();
        this.updateBoardDisplay();
        this.updateCandidates();
        this.clearHighlights();
        this.logMessage('Board reset to initial state', 'info');
    }

    updateTacticDescription() {
        const selectedTactic = this.tacticSelect.value;
        const description = this.tactics.getTacticDescription(selectedTactic);
        this.tacticDescription.innerHTML = `
            <h4>${description.name}</h4>
            <p><strong>Difficulty:</strong> ${description.difficulty}</p>
            <p>${description.description}</p>
            <p><strong>How it works:</strong> ${description.explanation}</p>
        `;
    }

    addThermoSudoku() {
        const thermoPaths = this.extensions.getExampleThermoPaths();
        const result = this.extensions.addThermoSudoku(thermoPaths);
        if (result.success) { this.updateCandidates(); this.updateExtensionInfo(); this.logMessage(result.message, 'success'); }
    }

    addKnightsMove() {
        const result = this.extensions.addKnightsMove();
        if (result.success) { this.updateCandidates(); this.updateExtensionInfo(); this.logMessage(result.message, 'success'); }
    }

    addKingsMove() {
        const result = this.extensions.addKingsMove();
        if (result.success) { this.updateCandidates(); this.updateExtensionInfo(); this.logMessage(result.message, 'success'); }
    }

    addBoxSumNeighbor() {
        const result = this.extensions.addBoxSumNeighbor();
        if (result.success) { this.updateCandidates(); this.updateExtensionInfo(); this.logMessage(result.message, 'success'); }
    }

    clearExtensions() {
        const result = this.extensions.clearExtensions();
        if (result.success) { this.updateCandidates(); this.updateExtensionInfo(); this.logMessage(result.message, 'success'); }
    }

    updateExtensionInfo() {
        const active = this.extensions.getActiveExtensions();
        if (active.length === 0) { this.extensionInfo.innerHTML = '<p>No extensions active. Add custom rules to enhance the puzzle.</p>'; return; }
        let html = '<h4>Active Extensions:</h4><ul>';
        active.forEach(ext => {
            const desc = this.extensions.getExtensionDescription(ext);
            const count = this.extensions.getConstraintCount(ext);
            html += `<li><strong>${desc.name}</strong> (${desc.difficulty})<br><small>${desc.description}</small><br><small>Constraints: ${count}</small></li>`;
        });
        html += '</ul>';
        this.extensionInfo.innerHTML = html;
    }

    // CONFLICT CHECKING
    checkConflicts() {
        const conflictKeys = new Set();
        const noCandKeys = new Set();
        const unitIssueKeys = new Set();

        // Rows conflicts (duplicate fixed digits)
        for (let r = 0; r < 9; r++) {
            const map = new Map();
            for (let c = 0; c < 9; c++) {
                const v = this.board.getValue(r, c);
                if (v === 0) continue;
                const arr = map.get(v) || [];
                arr.push([r, c]);
                map.set(v, arr);
            }
            for (const [, positions] of map) {
                if (positions.length > 1) positions.forEach(([rr, cc]) => conflictKeys.add(`${rr},${cc}`));
            }
        }

        // Columns conflicts
        for (let c = 0; c < 9; c++) {
            const map = new Map();
            for (let r = 0; r < 9; r++) {
                const v = this.board.getValue(r, c);
                if (v === 0) continue;
                const arr = map.get(v) || [];
                arr.push([r, c]);
                map.set(v, arr);
            }
            for (const [, positions] of map) {
                if (positions.length > 1) positions.forEach(([rr, cc]) => conflictKeys.add(`${rr},${cc}`));
            }
        }

        // Boxes conflicts
        for (let br = 0; br < 3; br++) {
            for (let bc = 0; bc < 3; bc++) {
                const map = new Map();
                for (let r = br * 3; r < br * 3 + 3; r++) {
                    for (let c = bc * 3; c < bc * 3 + 3; c++) {
                        const v = this.board.getValue(r, c);
                        if (v === 0) continue;
                        const arr = map.get(v) || [];
                        arr.push([r, c]);
                        map.set(v, arr);
                    }
                }
                for (const [, positions] of map) {
                    if (positions.length > 1) positions.forEach(([rr, cc]) => conflictKeys.add(`${rr},${cc}`));
                }
            }
        }

        // No candidates cells
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.board.getValue(r, c) === 0 && this.board.candidates[r][c].size === 0) {
                    noCandKeys.add(`${r},${c}`);
                }
            }
        }

        // Unit-level impossibility: for each unit and digit, ensure at least one spot has the digit as candidate or fixed
        // Rows
        for (let r = 0; r < 9; r++) {
            for (let d = 1; d <= 9; d++) {
                const hasFixed = this.board.getRow(r).includes(d);
                if (hasFixed) continue;
                let places = [];
                for (let c = 0; c < 9; c++) {
                    if (this.board.getValue(r, c) === 0 && this.board.candidates[r][c].has(d)) places.push([r, c]);
                }
                if (places.length === 0) {
                    // mark all empties in row to indicate unit issue
                    for (let c = 0; c < 9; c++) if (this.board.getValue(r, c) === 0) unitIssueKeys.add(`${r},${c}`);
                }
            }
        }
        // Columns
        for (let c = 0; c < 9; c++) {
            for (let d = 1; d <= 9; d++) {
                let hasFixed = false;
                for (let r = 0; r < 9; r++) { if (this.board.getValue(r, c) === d) { hasFixed = true; break; } }
                if (hasFixed) continue;
                let places = [];
                for (let r = 0; r < 9; r++) {
                    if (this.board.getValue(r, c) === 0 && this.board.candidates[r][c].has(d)) places.push([r, c]);
                }
                if (places.length === 0) {
                    for (let r = 0; r < 9; r++) if (this.board.getValue(r, c) === 0) unitIssueKeys.add(`${r},${c}`);
                }
            }
        }
        // Boxes
        for (let br = 0; br < 3; br++) {
            for (let bc = 0; bc < 3; bc++) {
                for (let d = 1; d <= 9; d++) {
                    let hasFixed = false;
                    let empties = [];
                    for (let r = br * 3; r < br * 3 + 3; r++) {
                        for (let c = bc * 3; c < bc * 3 + 3; c++) {
                            const v = this.board.getValue(r, c);
                            if (v === d) { hasFixed = true; }
                            if (v === 0) empties.push([r, c]);
                        }
                    }
                    if (hasFixed) continue;
                    let hasPlace = false;
                    for (const [r, c] of empties) {
                        if (this.board.candidates[r][c].has(d)) { hasPlace = true; break; }
                    }
                    if (!hasPlace && empties.length > 0) {
                        for (const [r, c] of empties) unitIssueKeys.add(`${r},${c}`);
                    }
                }
            }
        }

        // Apply highlights
        this.cells.forEach(cell => cell.classList.remove('conflict', 'nocands', 'unit-issue'));
        conflictKeys.forEach(key => { const [r,c]=key.split(',').map(Number); this.getCellElement(r,c).classList.add('conflict'); });
        noCandKeys.forEach(key => { const [r,c]=key.split(',').map(Number); this.getCellElement(r,c).classList.add('nocands'); });
        unitIssueKeys.forEach(key => { const [r,c]=key.split(',').map(Number); this.getCellElement(r,c).classList.add('unit-issue'); });

        // Log when state changes
        const conflictsChanged = !this.setsEqual(conflictKeys, this.lastConflictKeys);
        const noCandsChanged = !this.setsEqual(noCandKeys, this.lastNoCandKeys);
        const unitIssuesChanged = !this.setsEqual(unitIssueKeys, this.lastUnitIssueKeys || new Set());
        if (conflictsChanged || noCandsChanged || unitIssuesChanged) {
            if (conflictKeys.size > 0) this.logMessage(`Conflicts detected in ${conflictKeys.size} cell(s)`, 'error');
            if (noCandKeys.size > 0) this.logMessage(`No-candidate issue in ${noCandKeys.size} cell(s)`, 'warning');
            if (unitIssueKeys.size > 0) this.logMessage(`Unit impossibility detected (a digit has no place)`, 'warning');
            if (conflictKeys.size === 0 && noCandKeys.size === 0 && unitIssueKeys.size === 0) this.logMessage('No conflicts detected', 'success');
        }
        this.lastConflictKeys = conflictKeys;
        this.lastNoCandKeys = noCandKeys;
        this.lastUnitIssueKeys = unitIssueKeys;
    }

    setsEqual(a, b) {
        if (a.size !== b.size) return false;
        for (const v of a) if (!b.has(v)) return false;
        return true;
    }

    logMessage(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `<strong>[${timestamp}]</strong> ${message}`;
        this.solvingLog.appendChild(entry);
        this.solvingLog.scrollTop = this.solvingLog.scrollHeight;
        const entries = this.solvingLog.querySelectorAll('.log-entry');
        if (entries.length > 50) entries[0].remove();
    }

    getBoardState() {
        return { board: this.board.board, initialBoard: this.board.initialBoard, extensions: this.extensions.exportState(), solvingHistory: this.solvingHistory };
    }

    loadBoardState(state) {
        if (state.board) this.board.loadPuzzle(state.board);
        if (state.extensions) this.extensions.importState(state.extensions);
        if (state.solvingHistory) this.solvingHistory = state.solvingHistory;
        this.updateBoardDisplay();
        this.updateCandidates();
        this.updateExtensionInfo();
    }

    loadFromCodeInput() {
        const input = document.getElementById('codeInput');
        const code = (input.value || '').trim();
        try {
            this.board.loadFromCode(code);
            this.updateBoardDisplay();
            this.updateCandidates();
            this.clearHighlights();
            this.solvingHistory = [];
            this.logMessage('Loaded puzzle from 81-digit code', 'success');
        } catch (e) {
            this.logMessage(e.message || 'Invalid code', 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => { window.sudokuApp = new SudokuApp(); });
