class SudokuTactics {
    constructor(board) {
        this.board = board;
        this.extensions = null; // optional
        this.tacticDescriptions = {
            'naked-single': {
                name: 'Naked Single',
                description: 'A cell that has only one possible candidate remaining. This is the most basic solving technique.',
                difficulty: 'Easy',
                explanation: 'When a cell has only one possible number that can be placed there, that number must be the solution for that cell.'
            },
            'hidden-single': {
                name: 'Hidden Single',
                description: 'A number that can only be placed in one cell within a row, column, or box.',
                difficulty: 'Easy',
                explanation: 'When a number appears as a candidate in only one cell within a row, column, or 3x3 box, that number must be placed in that cell.'
            },
            'naked-pair': {
                name: 'Naked Pair',
                description: 'Two cells in the same unit that contain the same two candidates and no others.',
                difficulty: 'Medium',
                explanation: 'When two cells in the same row, column, or box have exactly the same two candidates, those candidates can be removed from other cells in that unit.'
            },
            'hidden-pair': {
                name: 'Hidden Pair',
                description: 'Two numbers that can only appear in two cells within a unit.',
                difficulty: 'Medium',
                explanation: 'When two numbers appear as candidates in only two cells within a row, column, or box, all other candidates can be removed from those two cells.'
            },
            'pointing-pair': {
                name: 'Pointing Pair',
                description: 'When candidates in a box are restricted to one row or column, they can be eliminated from the rest of that row or column.',
                difficulty: 'Medium',
                explanation: 'If all instances of a candidate in a 3x3 box are in the same row or column, that candidate can be removed from other cells in that row or column outside the box.'
            },
            'box-line-reduction': {
                name: 'Box-Line Reduction',
                description: 'When candidates in a row or column are restricted to one box, they can be eliminated from the rest of that box.',
                difficulty: 'Medium',
                explanation: 'If all instances of a candidate in a row or column are within the same 3x3 box, that candidate can be removed from other cells in that box.'
            },
            'x-wing': {
                name: 'X-Wing',
                description: 'A pattern where a candidate appears exactly twice in two rows and in the same columns.',
                difficulty: 'Hard',
                explanation: 'When a candidate appears exactly twice in two rows and in the same two columns, that candidate can be eliminated from all other cells in those columns.'
            },
            'swordfish': {
                name: 'Swordfish',
                description: 'An extension of X-Wing involving three rows and three columns.',
                difficulty: 'Hard',
                explanation: 'When a candidate appears exactly twice in three rows and in the same three columns, that candidate can be eliminated from all other cells in those columns.'
            },
            'xy-wing': {
                name: 'XY-Wing',
                description: 'A pattern involving three cells where one cell has candidates XY, another has XZ, and a third has YZ.',
                difficulty: 'Hard',
                explanation: 'When three cells form this pattern, the common candidate Z can be eliminated from cells that see both the XZ and YZ cells.'
            },
            'xyz-wing': {
                name: 'XYZ-Wing',
                description: 'An extension of XY-Wing involving four cells with candidates XYZ, XZ, YZ, and Z.',
                difficulty: 'Very Hard',
                explanation: 'When four cells form this pattern, the candidate Z can be eliminated from cells that see all three cells with Z candidates.'
            },
            'single-step-guess': {
                name: 'Single-Step Guess (Contradiction)',
                description: 'Temporarily assume a candidate in a cell. If this immediately causes a contradiction (no candidates in a cell or a digit has no place in a unit), eliminate that candidate.',
                difficulty: 'Medium',
                explanation: 'Try a candidate and propagate constraints once. If the assumption leaves a unit without a place for some digit, that candidate is impossible.'
            }
        };
    }

    setExtensions(extensions) {
        this.extensions = extensions;
    }

    // Execute a specific tactic
    executeTactic(tacticName) {
        switch (tacticName) {
            case 'naked-single':
                return this.findNakedSingles();
            case 'hidden-single':
                return this.findHiddenSingles();
            case 'naked-pair':
                return this.findNakedPairs();
            case 'hidden-pair':
                return this.findHiddenPairs();
            case 'pointing-pair':
                return this.findPointingPairs();
            case 'box-line-reduction':
                return this.findBoxLineReductions();
            case 'x-wing':
                return this.findXWings();
            case 'swordfish':
                return this.findSwordfish();
            case 'xy-wing':
                return this.findXYWings();
            case 'xyz-wing':
                return this.findXYZWings();
            case 'single-step-guess':
                return this.findSingleStepGuess();
            default:
                return { found: false, message: 'Unknown tactic' };
        }
    }

    // Single-Step Guess tactic
    findSingleStepGuess() {
        // Need extensions to faithfully evaluate variant constraints
        const useExtensions = !!this.extensions;
        const exported = useExtensions ? this.extensions.exportState() : null;

        const emptyCells = this.board.getEmptyCells();
        for (const { row, col } of emptyCells) {
            const cands = this.board.getCandidates(row, col);
            for (const cand of cands) {
                const testBoard = this.cloneBoard(this.board);
                let testExtensions = null;
                if (useExtensions) {
                    testExtensions = new SudokuExtensions(testBoard);
                    testExtensions.importState(exported);
                }

                // Apply candidate
                testBoard.setValue(row, col, cand);
                // Recompute candidates with all rules
                testBoard.updateCandidates();
                if (testExtensions) testExtensions.updateCandidatesWithExtensions();

                const contradiction = this.detectImmediateContradiction(testBoard);
                if (contradiction) {
                    // Eliminate candidate from real board (do not set value)
                    return {
                        found: true,
                        message: `Single-step guess: assuming ${cand} at (${row + 1}, ${col + 1}) leads to contradiction (${contradiction}). Eliminating ${cand}.`,
                        changes: [{ row, col, removed: [cand], type: 'elimination' }],
                        type: 'single-step-guess'
                    };
                }
            }
        }
        return { found: false, message: 'No contradiction-based eliminations found' };
    }

    cloneBoard(sourceBoard) {
        const b = new SudokuBoard();
        b.board = sourceBoard.board.map(r => [...r]);
        b.initialBoard = sourceBoard.initialBoard.map(r => [...r]);
        b.updateCandidates();
        return b;
    }

    detectImmediateContradiction(testBoard) {
        // 1) any empty cell with zero candidates
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (testBoard.getValue(r, c) === 0 && testBoard.candidates[r][c].size === 0) {
                    return 'cell has no candidates';
                }
            }
        }
        // 2) unit-level impossibility: for each unit and digit, ensure at least one place
        // rows
        for (let r = 0; r < 9; r++) {
            for (let d = 1; d <= 9; d++) {
                if (testBoard.getRow(r).includes(d)) continue;
                let places = 0;
                for (let c = 0; c < 9; c++) {
                    if (testBoard.getValue(r, c) === 0 && testBoard.candidates[r][c].has(d)) places++;
                }
                if (places === 0) return `row ${r + 1} has no place for ${d}`;
            }
        }
        // columns
        for (let c = 0; c < 9; c++) {
            for (let d = 1; d <= 9; d++) {
                let hasFixed = false;
                for (let r = 0; r < 9; r++) { if (testBoard.getValue(r, c) === d) { hasFixed = true; break; } }
                if (hasFixed) continue;
                let places = 0;
                for (let r = 0; r < 9; r++) {
                    if (testBoard.getValue(r, c) === 0 && testBoard.candidates[r][c].has(d)) places++;
                }
                if (places === 0) return `column ${c + 1} has no place for ${d}`;
            }
        }
        // boxes
        for (let br = 0; br < 3; br++) {
            for (let bc = 0; bc < 3; bc++) {
                for (let d = 1; d <= 9; d++) {
                    let hasFixed = false;
                    let places = 0;
                    for (let r = br * 3; r < br * 3 + 3; r++) {
                        for (let c = bc * 3; c < bc * 3 + 3; c++) {
                            const v = testBoard.getValue(r, c);
                            if (v === d) { hasFixed = true; }
                            if (v === 0 && testBoard.candidates[r][c].has(d)) places++;
                        }
                    }
                    if (!hasFixed && places === 0) return `box (${br + 1}, ${bc + 1}) has no place for ${d}`;
                }
            }
        }
        return null;
    }

    // Naked Single tactic
    findNakedSingles() {
        const singles = this.board.getNakedSingles();
        
        if (singles.length === 0) {
            return { found: false, message: 'No naked singles found' };
        }

        const result = singles[0]; // Take the first one
        this.board.setValue(result.row, result.col, result.value);
        
        return {
            found: true,
            message: `Found naked single: ${result.value} at (${result.row + 1}, ${result.col + 1})`,
            changes: [{
                row: result.row,
                col: result.col,
                value: result.value,
                type: 'naked-single'
            }]
        };
    }

    // Hidden Single tactic
    findHiddenSingles() {
        const singles = this.board.getHiddenSingles();
        
        if (singles.length === 0) {
            return { found: false, message: 'No hidden singles found' };
        }

        const result = singles[0]; // Take the first one
        this.board.setValue(result.row, result.col, result.value);
        
        return {
            found: true,
            message: `Found hidden single: ${result.value} at (${result.row + 1}, ${result.col + 1}) in ${result.type}`,
            changes: [{
                row: result.row,
                col: result.col,
                value: result.value,
                type: 'hidden-single',
                context: result.type
            }]
        };
    }

    // Naked Pair tactic
    findNakedPairs() {
        const pairs = [];
        
        // Check rows
        for (let row = 0; row < 9; row++) {
            const rowPairs = this.findNakedPairsInUnit(this.getRowCandidates(row), row, 'row');
            pairs.push(...rowPairs);
        }
        
        // Check columns
        for (let col = 0; col < 9; col++) {
            const colPairs = this.findNakedPairsInUnit(this.getColumnCandidates(col), col, 'column');
            pairs.push(...colPairs);
        }
        
        // Check boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const boxPairs = this.findNakedPairsInBox(boxRow, boxCol);
                pairs.push(...boxPairs);
            }
        }
        
        if (pairs.length === 0) {
            return { found: false, message: 'No naked pairs found' };
        }

        // Try each pair; return the first that actually eliminates any candidates
        for (const p of pairs) {
            const eliminations = this.computeNakedPairEliminations(p);
            if (eliminations.length > 0) {
                return {
                    found: true,
                    message: `Found naked pair: ${p.values.join(',')} in ${p.unit} ${p.unitIndex + 1}`,
                    changes: eliminations.map(e => ({ row: e.row, col: e.col, removed: [e.value] })),
                    type: 'naked-pair'
                };
            }
        }

        return { found: false, message: 'Naked pairs found but none produce eliminations' };
    }

    findNakedPairsInUnit(candidates, unitIndex, unitType) {
        const pairs = [];
        const cells = [];
        
        // Find cells with exactly 2 candidates
        for (let value = 1; value <= 9; value++) {
            if (candidates[value].length === 2) {
                cells.push({ value, positions: candidates[value] });
            }
        }
        
        // Look for pairs
        for (let i = 0; i < cells.length; i++) {
            for (let j = i + 1; j < cells.length; j++) {
                if (cells[i].positions.length === 2 && 
                    cells[j].positions.length === 2 &&
                    cells[i].positions[0] === cells[j].positions[0] &&
                    cells[i].positions[1] === cells[j].positions[1]) {
                    
                    pairs.push({
                        values: [cells[i].value, cells[j].value],
                        positions: cells[i].positions,
                        unit: unitType,
                        unitIndex: unitIndex
                    });
                }
            }
        }
        
        return pairs;
    }

    findNakedPairsInBox(boxRow, boxCol) {
        const pairs = [];
        const startRow = boxRow * 3;
        const startCol = boxCol * 3;
        const boxCandidates = {};
        
        // Get candidates for each cell in the box
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (this.board.getValue(r, c) === 0) {
                    const candidates = this.board.getCandidates(r, c);
                    if (candidates.length === 2) {
                        const key = candidates.sort().join(',');
                        if (!boxCandidates[key]) {
                            boxCandidates[key] = [];
                        }
                        boxCandidates[key].push({ row: r, col: c });
                    }
                }
            }
        }
        
        // Find pairs
        for (const [candidateKey, positions] of Object.entries(boxCandidates)) {
            if (positions.length === 2) {
                const values = candidateKey.split(',').map(v => parseInt(v));
                pairs.push({
                    values,
                    positions: positions,
                    unit: 'box',
                    unitIndex: boxRow * 3 + boxCol
                });
            }
        }
        
        return pairs;
    }

    // Replace applyNakedPairEliminations with a pure computation
    computeNakedPairEliminations(pair) {
        const eliminations = [];
        const shouldRemove = (cands, values) => values.filter(v => cands.includes(v));

        if (pair.unit === 'row') {
            const row = pair.unitIndex;
            for (let col = 0; col < 9; col++) {
                if (!pair.positions.includes(col) && this.board.getValue(row, col) === 0) {
                    const candidates = this.board.getCandidates(row, col);
                    const toRemove = shouldRemove(candidates, pair.values);
                    toRemove.forEach(val => eliminations.push({ row, col, value: val }));
                }
            }
        } else if (pair.unit === 'column') {
            const col = pair.unitIndex;
            for (let row = 0; row < 9; row++) {
                if (!pair.positions.includes(row) && this.board.getValue(row, col) === 0) {
                    const candidates = this.board.getCandidates(row, col);
                    const toRemove = shouldRemove(candidates, pair.values);
                    toRemove.forEach(val => eliminations.push({ row, col, value: val }));
                }
            }
        } else if (pair.unit === 'box') {
            const startRow = Math.floor(pair.unitIndex / 3) * 3;
            const startCol = (pair.unitIndex % 3) * 3;
            
            for (let r = startRow; r < startRow + 3; r++) {
                for (let c = startCol; c < startCol + 3; c++) {
                    const isPairCell = pair.positions.some(pos => pos.row === r && pos.col === c);
                    if (!isPairCell && this.board.getValue(r, c) === 0) {
                        const candidates = this.board.getCandidates(r, c);
                        const toRemove = shouldRemove(candidates, pair.values);
                        toRemove.forEach(val => eliminations.push({ row: r, col: c, value: val }));
                    }
                }
            }
        }
        return eliminations;
    }

    // Hidden Pair tactic
    findHiddenPairs() {
        const pairs = [];
        
        // Check rows
        for (let row = 0; row < 9; row++) {
            const rowPairs = this.findHiddenPairsInUnit(this.getRowCandidates(row), row, 'row');
            pairs.push(...rowPairs);
        }
        
        // Check columns
        for (let col = 0; col < 9; col++) {
            const colPairs = this.findHiddenPairsInUnit(this.getColumnCandidates(col), col, 'column');
            pairs.push(...colPairs);
        }
        
        // Check boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const boxPairs = this.findHiddenPairsInBox(boxRow, boxCol);
                pairs.push(...boxPairs);
            }
        }
        
        if (pairs.length === 0) {
            return { found: false, message: 'No hidden pairs found' };
        }

        const result = pairs[0];
        this.applyHiddenPairRestrictions(result);
        
        return {
            found: true,
            message: `Found hidden pair: ${result.values.join(',')} in ${result.unit} ${result.unitIndex + 1}`,
            changes: result.restrictions,
            type: 'hidden-pair'
        };
    }

    findHiddenPairsInUnit(candidates, unitIndex, unitType) {
        const pairs = [];
        
        // Look for two values that appear in exactly the same two positions
        for (let val1 = 1; val1 <= 8; val1++) {
            for (let val2 = val1 + 1; val2 <= 9; val2++) {
                if (candidates[val1].length === 2 && candidates[val2].length === 2) {
                    if (candidates[val1][0] === candidates[val2][0] && 
                        candidates[val1][1] === candidates[val2][1]) {
                        
                        pairs.push({
                            values: [val1, val2],
                            positions: candidates[val1],
                            unit: unitType,
                            unitIndex: unitIndex
                        });
                    }
                }
            }
        }
        
        return pairs;
    }

    findHiddenPairsInBox(boxRow, boxCol) {
        const pairs = [];
        const startRow = boxRow * 3;
        const startCol = boxCol * 3;
        const boxCandidates = {};
        
        // Get candidates for each cell in the box
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (this.board.getValue(r, c) === 0) {
                    const candidates = this.board.getCandidates(r, c);
                    candidates.forEach(val => {
                        if (!boxCandidates[val]) {
                            boxCandidates[val] = [];
                        }
                        boxCandidates[val].push({ row: r, col: c });
                    });
                }
            }
        }
        
        // Look for hidden pairs
        for (let val1 = 1; val1 <= 8; val1++) {
            for (let val2 = val1 + 1; val2 <= 9; val2++) {
                if (boxCandidates[val1] && boxCandidates[val2] &&
                    boxCandidates[val1].length === 2 && boxCandidates[val2].length === 2) {
                    
                    const pos1 = boxCandidates[val1];
                    const pos2 = boxCandidates[val2];
                    
                    if (pos1[0].row === pos2[0].row && pos1[0].col === pos2[0].col &&
                        pos1[1].row === pos2[1].row && pos1[1].col === pos2[1].col) {
                        
                        pairs.push({
                            values: [val1, val2],
                            positions: pos1,
                            unit: 'box',
                            unitIndex: boxRow * 3 + boxCol
                        });
                    }
                }
            }
        }
        
        return pairs;
    }

    applyHiddenPairRestrictions(pair) {
        const restrictions = [];
        
        pair.positions.forEach(pos => {
            const candidates = this.board.getCandidates(pos.row, pos.col);
            const originalSize = candidates.length;
            const newCandidates = candidates.filter(c => pair.values.includes(c));
            
            if (newCandidates.length < originalSize) {
                this.board.candidates[pos.row][pos.col].clear();
                newCandidates.forEach(c => this.board.candidates[pos.row][pos.col].add(c));
                
                restrictions.push({
                    row: pos.row,
                    col: pos.col,
                    removed: candidates.filter(c => !pair.values.includes(c)),
                    kept: newCandidates,
                    type: 'restriction'
                });
            }
        });
        
        pair.restrictions = restrictions;
    }

    // Pointing Pair tactic
    findPointingPairs() {
        const eliminations = [];
        
        // Check each box
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const boxEliminations = this.findPointingPairsInBox(boxRow, boxCol);
                eliminations.push(...boxEliminations);
            }
        }
        
        if (eliminations.length === 0) {
            return { found: false, message: 'No pointing pairs found' };
        }

        const result = eliminations[0];
        this.applyPointingPairEliminations(result);
        
        return {
            found: true,
            message: `Found pointing pair: ${result.value} in box (${result.boxRow + 1}, ${result.boxCol + 1}) pointing to ${result.direction}`,
            changes: result.eliminations.map(e => ({ row: e.row, col: e.col, removed: [e.value] })),
            type: 'pointing-pair'
        };
    }

    findPointingPairsInBox(boxRow, boxCol) {
        const eliminations = [];
        const startRow = boxRow * 3;
        const startCol = boxCol * 3;
        const boxCandidates = {};
        
        // Get candidates for each cell in the box
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (this.board.getValue(r, c) === 0) {
                    const candidates = this.board.getCandidates(r, c);
                    candidates.forEach(val => {
                        if (!boxCandidates[val]) {
                            boxCandidates[val] = [];
                        }
                        boxCandidates[val].push({ row: r, col: c });
                    });
                }
            }
        }
        
        // Check each candidate
        for (const [value, positions] of Object.entries(boxCandidates)) {
            if (positions.length >= 2) {
                const val = parseInt(value);
                
                // Check if all positions are in the same row
                const rows = [...new Set(positions.map(p => p.row))];
                if (rows.length === 1) {
                    const row = rows[0];
                    const elims = this.getPointingPairEliminations(val, row, 'row', boxCol);
                    if (elims.length > 0) {
                        eliminations.push({
                            value: val,
                            boxRow, boxCol,
                            direction: 'row',
                            eliminations: elims
                        });
                    }
                }
                
                // Check if all positions are in the same column
                const cols = [...new Set(positions.map(p => p.col))];
                if (cols.length === 1) {
                    const col = cols[0];
                    const elims = this.getPointingPairEliminations(val, col, 'column', boxRow);
                    if (elims.length > 0) {
                        eliminations.push({
                            value: val,
                            boxRow, boxCol,
                            direction: 'column',
                            eliminations: elims
                        });
                    }
                }
            }
        }
        
        return eliminations;
    }

    getPointingPairEliminations(value, unitIndex, unitType, boxIndex) {
        const eliminations = [];
        
        if (unitType === 'row') {
            const row = unitIndex;
            const boxStartCol = boxIndex * 3;
            
            for (let col = 0; col < 9; col++) {
                if (col < boxStartCol || col >= boxStartCol + 3) {
                    if (this.board.getValue(row, col) === 0) {
                        const candidates = this.board.getCandidates(row, col);
                        if (candidates.includes(value)) {
                            eliminations.push({ row, col, value });
                        }
                    }
                }
            }
        } else if (unitType === 'column') {
            const col = unitIndex;
            const boxStartRow = boxIndex * 3;
            
            for (let row = 0; row < 9; row++) {
                if (row < boxStartRow || row >= boxStartRow + 3) {
                    if (this.board.getValue(row, col) === 0) {
                        const candidates = this.board.getCandidates(row, col);
                        if (candidates.includes(value)) {
                            eliminations.push({ row, col, value });
                        }
                    }
                }
            }
        }
        
        return eliminations;
    }

    applyPointingPairEliminations(result) {
        result.eliminations.forEach(elim => {
            this.board.candidates[elim.row][elim.col].delete(elim.value);
        });
    }

    // Box-Line Reduction tactic
    findBoxLineReductions() {
        const eliminations = [];
        
        // Check each row
        for (let row = 0; row < 9; row++) {
            const rowEliminations = this.findBoxLineReductionsInUnit(row, 'row');
            eliminations.push(...rowEliminations);
        }
        
        // Check each column
        for (let col = 0; col < 9; col++) {
            const colEliminations = this.findBoxLineReductionsInUnit(col, 'column');
            eliminations.push(...colEliminations);
        }
        
        if (eliminations.length === 0) {
            return { found: false, message: 'No box-line reductions found' };
        }

        const result = eliminations[0];
        this.applyBoxLineReductionEliminations(result);
        
        return {
            found: true,
            message: `Found box-line reduction: ${result.value} in ${result.unitType} ${result.unitIndex + 1} restricted to box (${result.boxRow + 1}, ${result.boxCol + 1})`,
            changes: result.eliminations.map(e => ({ row: e.row, col: e.col, removed: [e.value] })),
            type: 'box-line-reduction'
        };
    }

    findBoxLineReductionsInUnit(unitIndex, unitType) {
        const eliminations = [];
        const candidates = unitType === 'row' ? 
            this.board.getRowCandidates(unitIndex) : 
            this.board.getColumnCandidates(unitIndex);
        
        for (let value = 1; value <= 9; value++) {
            if (candidates[value].length >= 2) {
                const positions = candidates[value];
                
                // Check if all positions are in the same box
                const boxes = positions.map(pos => {
                    if (unitType === 'row') {
                        return Math.floor(pos / 3);
                    } else {
                        return Math.floor(pos / 3);
                    }
                });
                
                const uniqueBoxes = [...new Set(boxes)];
                if (uniqueBoxes.length === 1) {
                    const boxIndex = uniqueBoxes[0];
                    const boxRow = unitType === 'row' ? Math.floor(unitIndex / 3) : boxIndex;
                    const boxCol = unitType === 'row' ? boxIndex : Math.floor(unitIndex / 3);
                    
                    const elims = this.getBoxLineReductionEliminations(value, boxRow, boxCol, unitIndex, unitType);
                    if (elims.length > 0) {
                        eliminations.push({
                            value,
                            unitIndex,
                            unitType,
                            boxRow,
                            boxCol,
                            eliminations: elims
                        });
                    }
                }
            }
        }
        
        return eliminations;
    }

    getBoxLineReductionEliminations(value, boxRow, boxCol, unitIndex, unitType) {
        const eliminations = [];
        const startRow = boxRow * 3;
        const startCol = boxCol * 3;
        
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (this.board.getValue(r, c) === 0) {
                    const candidates = this.board.getCandidates(r, c);
                    if (candidates.includes(value)) {
                        // Check if this cell is not in the unit we're considering
                        const inUnit = unitType === 'row' ? r === unitIndex : c === unitIndex;
                        if (!inUnit) {
                            eliminations.push({ row: r, col: c, value });
                        }
                    }
                }
            }
        }
        
        return eliminations;
    }

    applyBoxLineReductionEliminations(result) {
        result.eliminations.forEach(elim => {
            this.board.candidates[elim.row][elim.col].delete(elim.value);
        });
    }

    // X-Wing tactic
    findXWings() {
        const xwings = [];
        
        // Check rows for X-Wing pattern
        for (let val = 1; val <= 9; val++) {
            const rowXWings = this.findXWingInRows(val);
            xwings.push(...rowXWings);
        }
        
        // Check columns for X-Wing pattern
        for (let val = 1; val <= 9; val++) {
            const colXWings = this.findXWingInColumns(val);
            xwings.push(...colXWings);
        }
        
        if (xwings.length === 0) {
            return { found: false, message: 'No X-Wings found' };
        }

        // Try each X-Wing and return the first one that actually eliminates candidates
        for (const x of xwings) {
            const eliminations = this.applyXWingEliminations(x); // compute only
            if (eliminations.length > 0) {
                return {
                    found: true,
                    message: `Found X-Wing: ${x.value} in ${x.type} ${x.positions.join(', ')}`,
                    changes: eliminations.map(e => ({ row: e.row, col: e.col, removed: [e.value] })),
                    type: 'x-wing'
                };
            }
        }

        return { found: false, message: 'X-Wing(s) found but none produce eliminations' };
    }

    findXWingInRows(value) {
        const xwings = [];
        const rowCandidates = {};
        
        // Find rows with exactly 2 candidates for this value
        for (let row = 0; row < 9; row++) {
            const candidates = this.board.getRowCandidates(row);
            if (candidates[value] && candidates[value].length === 2) {
                rowCandidates[row] = candidates[value];
            }
        }
        
        // Look for X-Wing pattern
        const rows = Object.keys(rowCandidates).map(Number);
        for (let i = 0; i < rows.length; i++) {
            for (let j = i + 1; j < rows.length; j++) {
                const row1 = rows[i];
                const row2 = rows[j];
                const cols1 = rowCandidates[row1];
                const cols2 = rowCandidates[row2];
                
                if (cols1[0] === cols2[0] && cols1[1] === cols2[1]) {
                    xwings.push({
                        value,
                        type: 'rows',
                        positions: [row1, row2],
                        columns: cols1,
                        eliminations: []
                    });
                }
            }
        }
        
        return xwings;
    }

    findXWingInColumns(value) {
        const xwings = [];
        const colCandidates = {};
        
        // Find columns with exactly 2 candidates for this value
        for (let col = 0; col < 9; col++) {
            const candidates = this.board.getColumnCandidates(col);
            if (candidates[value] && candidates[value].length === 2) {
                colCandidates[col] = candidates[value];
            }
        }
        
        // Look for X-Wing pattern
        const cols = Object.keys(colCandidates).map(Number);
        for (let i = 0; i < cols.length; i++) {
            for (let j = i + 1; j < cols.length; j++) {
                const col1 = cols[i];
                const col2 = cols[j];
                const rows1 = colCandidates[col1];
                const rows2 = colCandidates[col2];
                
                if (rows1[0] === rows2[0] && rows1[1] === rows2[1]) {
                    xwings.push({
                        value,
                        type: 'columns',
                        positions: [col1, col2],
                        rows: rows1,
                        eliminations: []
                    });
                }
            }
        }
        
        return xwings;
    }

    applyXWingEliminations(xwing) {
        const eliminations = [];
        
        if (xwing.type === 'rows') {
            // Eliminate from other rows in the same columns
            for (let row = 0; row < 9; row++) {
                if (!xwing.positions.includes(row)) {
                    for (let col of xwing.columns) {
                        if (this.board.getValue(row, col) === 0) {
                            const candidates = this.board.getCandidates(row, col);
                            if (candidates.includes(xwing.value)) {
                                eliminations.push({ row, col, value: xwing.value });
                            }
                        }
                    }
                }
            }
        } else if (xwing.type === 'columns') {
            // Eliminate from other columns in the same rows
            for (let col = 0; col < 9; col++) {
                if (!xwing.positions.includes(col)) {
                    for (let row of xwing.rows) {
                        if (this.board.getValue(row, col) === 0) {
                            const candidates = this.board.getCandidates(row, col);
                            if (candidates.includes(xwing.value)) {
                                eliminations.push({ row, col, value: xwing.value });
                            }
                        }
                    }
                }
            }
        }
        
        // Do NOT mutate candidates here; return for the app to apply persistently
        xwing.eliminations = eliminations;
        return eliminations;
    }

    // Swordfish tactic (simplified implementation)
    findSwordfish() {
        return { found: false, message: 'Swordfish tactic not yet implemented' };
    }

    // XY-Wing tactic (simplified implementation)
    findXYWings() {
        return { found: false, message: 'XY-Wing tactic not yet implemented' };
    }

    // XYZ-Wing tactic (simplified implementation)
    findXYZWings() {
        return { found: false, message: 'XYZ-Wing tactic not yet implemented' };
    }

    // Helper methods
    getRowCandidates(row) {
        return this.board.getRowCandidates(row);
    }

    getColumnCandidates(col) {
        return this.board.getColumnCandidates(col);
    }

    getBoxCandidates(boxRow, boxCol) {
        return this.board.getBoxCandidates(boxRow, boxCol);
    }

    // Get tactic description
    getTacticDescription(tacticName) {
        return this.tacticDescriptions[tacticName] || {
            name: 'Unknown',
            description: 'Unknown tactic',
            difficulty: 'Unknown',
            explanation: 'No explanation available'
        };
    }
}
