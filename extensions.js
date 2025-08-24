class SudokuExtensions {
    constructor(board) {
        this.board = board;
        this.extensions = new Map();
        this.thermoConstraints = [];
        this.knightConstraints = [];
        this.kingConstraints = [];
        this.extensionDescriptions = {
            'thermo': {
                name: 'Thermo Sudoku',
                description: 'Numbers along a thermometer must increase from the bulb to the tip.',
                rules: ['Numbers must increase along each thermometer', 'Thermometers are marked with special cells'],
                difficulty: 'Medium'
            },
            'knight': {
                name: "Knight's Move Sudoku",
                description: 'Numbers cannot repeat in cells that are a knight\'s move away (L-shaped).',
                rules: ['No number can appear in cells separated by a knight\'s move', 'Knight\'s move: 2 cells in one direction, 1 cell perpendicular'],
                difficulty: 'Hard'
            },
            'king': {
                name: "King's Move Sudoku",
                description: 'Numbers cannot repeat in cells that are adjacent (including diagonally).',
                rules: ['No number can appear in adjacent cells', 'Adjacent includes diagonal neighbors'],
                difficulty: 'Medium'
            },
            'box-sum-neighbor': {
                name: 'Box-Sum Neighbor',
                description: 'A cell value v cannot be next to any neighbor with value (boxNumber - v), where boxNumber ∈ {1..9} identifies the 3×3 box (rowBox*3 + colBox + 1).',
                rules: ['For any cell, consider its 8 neighbors. If the sum of that cell and a neighbor equals the numeric id of the box the cell is in, it is invalid.'],
                difficulty: 'Medium'
            }
        };
    }

    // Add thermo sudoku constraints
    addThermoSudoku(thermoPaths) {
        this.extensions.set('thermo', true);
        this.thermoConstraints = thermoPaths;
        
        return {
            success: true,
            message: `Added ${thermoPaths.length} thermo constraints`,
            constraints: thermoPaths
        };
    }

    // Add knight's move constraints
    addKnightsMove() {
        this.extensions.set('knight', true);
        this.knightConstraints = this.generateKnightConstraints();
        
        return {
            success: true,
            message: 'Added knight\'s move constraints',
            constraints: this.knightConstraints.length
        };
    }

    // Add king's move constraints
    addKingsMove() {
        this.extensions.set('king', true);
        this.kingConstraints = this.generateKingConstraints();
        
        return {
            success: true,
            message: 'Added king\'s move constraints',
            constraints: this.kingConstraints.length
        };
    }

    // Add box-sum-neighbor rule
    addBoxSumNeighbor() {
        this.extensions.set('box-sum-neighbor', true);
        return {
            success: true,
            message: 'Added Box-Sum Neighbor rule'
        };
    }

    // Clear all extensions
    clearExtensions() {
        this.extensions.clear();
        this.thermoConstraints = [];
        this.knightConstraints = [];
        this.kingConstraints = [];
        
        return {
            success: true,
            message: 'All extensions cleared'
        };
    }

    // Generate knight's move constraints for all cells
    generateKnightConstraints() {
        const constraints = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const neighbors = [];
                
                for (const [dr, dc] of knightMoves) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    
                    if (newRow >= 0 && newRow < 9 && newCol >= 0 && newCol < 9) {
                        neighbors.push({ row: newRow, col: newCol });
                    }
                }
                
                if (neighbors.length > 0) {
                    constraints.push({
                        cell: { row, col },
                        neighbors: neighbors
                    });
                }
            }
        }
        
        return constraints;
    }

    // Generate king's move constraints for all cells
    generateKingConstraints() {
        const constraints = [];
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const neighbors = [];
                
                for (const [dr, dc] of kingMoves) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    
                    if (newRow >= 0 && newRow < 9 && newCol >= 0 && newCol < 9) {
                        neighbors.push({ row: newRow, col: newCol });
                    }
                }
                
                if (neighbors.length > 0) {
                    constraints.push({
                        cell: { row, col },
                        neighbors: neighbors
                    });
                }
            }
        }
        
        return constraints;
    }

    // Validate a move considering all active extensions
    validateMove(row, col, value) {
        if (value === 0) return true;
        
        // Check basic sudoku rules first
        if (!this.board.isValid(row, col, value)) {
            return false;
        }
        
        // Check thermo constraints
        if (this.extensions.has('thermo')) {
            if (!this.validateThermoConstraints(row, col, value)) {
                return false;
            }
        }
        
        // Check knight's move constraints
        if (this.extensions.has('knight')) {
            if (!this.validateKnightConstraints(row, col, value)) {
                return false;
            }
        }
        
        // Check king's move constraints
        if (this.extensions.has('king')) {
            if (!this.validateKingConstraints(row, col, value)) {
                return false;
            }
        }

        // Box-sum-neighbor
        if (this.extensions.has('box-sum-neighbor')) {
            if (!this.validateBoxSumNeighbor(row, col, value)) {
                return false;
            }
        }
        
        return true;
    }

    // Validate thermo constraints
    validateThermoConstraints(row, col, value) {
        for (const thermo of this.thermoConstraints) {
            const cellIndex = thermo.findIndex(cell => cell.row === row && cell.col === col);
            
            if (cellIndex !== -1) {
                for (let i = 0; i < cellIndex; i++) {
                    const prevCell = thermo[i];
                    const prevValue = this.board.getValue(prevCell.row, prevCell.col);
                    if (prevValue !== 0 && value <= prevValue) return false;
                }
                for (let i = cellIndex + 1; i < thermo.length; i++) {
                    const nextCell = thermo[i];
                    const nextValue = this.board.getValue(nextCell.row, nextCell.col);
                    if (nextValue !== 0 && value >= nextValue) return false;
                }
            }
        }
        return true;
    }

    // Validate knight's move constraints
    validateKnightConstraints(row, col, value) {
        for (const constraint of this.knightConstraints) {
            if (constraint.cell.row === row && constraint.cell.col === col) {
                for (const neighbor of constraint.neighbors) {
                    const neighborValue = this.board.getValue(neighbor.row, neighbor.col);
                    if (neighborValue === value) return false;
                }
            }
        }
        return true;
    }

    // Validate king's move constraints
    validateKingConstraints(row, col, value) {
        for (const constraint of this.kingConstraints) {
            if (constraint.cell.row === row && constraint.cell.col === col) {
                for (const neighbor of constraint.neighbors) {
                    const neighborValue = this.board.getValue(neighbor.row, neighbor.col);
                    if (neighborValue === value) return false;
                }
            }
        }
        return true;
    }

    // Validate box-sum-neighbor rule
    validateBoxSumNeighbor(row, col, value) {
        const boxNumber = Math.floor(row / 3) * 3 + Math.floor(col / 3) + 1; // 1..9
        const targetNeighborValue = boxNumber - value;
        if (targetNeighborValue < 1 || targetNeighborValue > 9) return true; // no possible neighbor conflict
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr;
                const c = col + dc;
                if (r < 0 || r >= 9 || c < 0 || c >= 9) continue;
                if (this.board.getValue(r, c) === targetNeighborValue) {
                    return false;
                }
            }
        }
        return true;
    }

    // Update candidates based on extension constraints
    updateCandidatesWithExtensions() {
        if (!this.extensions.size) return;
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board.getValue(row, col) === 0) {
                    const candidates = this.board.getCandidates(row, col);
                    const validCandidates = candidates.filter(value => 
                        this.validateMove(row, col, value)
                    );
                    this.board.candidates[row][col].clear();
                    validCandidates.forEach(value => this.board.candidates[row][col].add(value));
                }
            }
        }
    }

    // Get example thermo sudoku paths
    getExampleThermoPaths() {
        return [
            [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}],
            [{row: 1, col: 1}, {row: 2, col: 1}, {row: 3, col: 1}, {row: 4, col: 1}],
            [{row: 2, col: 2}, {row: 2, col: 3}, {row: 2, col: 4}, {row: 2, col: 5}, {row: 2, col: 6}],
            [{row: 3, col: 0}, {row: 4, col: 0}, {row: 5, col: 0}],
            [{row: 5, col: 5}, {row: 5, col: 6}, {row: 5, col: 7}, {row: 5, col: 8}],
            [{row: 6, col: 2}, {row: 7, col: 2}, {row: 8, col: 2}],
            [{row: 7, col: 7}, {row: 8, col: 7}],
            [{row: 8, col: 0}, {row: 8, col: 1}, {row: 8, col: 2}, {row: 8, col: 3}]
        ];
    }

    // Get extension description
    getExtensionDescription(extensionName) {
        return this.extensionDescriptions[extensionName] || {
            name: 'Unknown Extension',
            description: 'Unknown extension',
            rules: [],
            difficulty: 'Unknown'
        };
    }

    // Get all active extensions
    getActiveExtensions() {
        return Array.from(this.extensions.keys());
    }

    // Check if an extension is active
    isExtensionActive(extensionName) {
        return this.extensions.has(extensionName);
    }

    // Get constraint count for an extension
    getConstraintCount(extensionName) {
        switch (extensionName) {
            case 'thermo':
                return this.thermoConstraints.length;
            case 'knight':
                return this.knightConstraints.length;
            case 'king':
                return this.kingConstraints.length;
            case 'box-sum-neighbor':
                return 9; // conceptual rule applied everywhere
            default:
                return 0;
        }
    }

    // Get visual representation of constraints for display
    getConstraintVisualization() {
        const visualization = {
            thermo: this.thermoConstraints,
            knight: this.knightConstraints.map(c => ({
                cell: c.cell,
                type: 'knight',
                neighbors: c.neighbors
            })),
            king: this.kingConstraints.map(c => ({
                cell: c.cell,
                type: 'king',
                neighbors: c.neighbors
            })),
            boxSumNeighbor: true
        };
        
        return visualization;
    }

    // Reset extensions to initial state
    reset() {
        this.extensions.clear();
        this.thermoConstraints = [];
        this.knightConstraints = [];
        this.kingConstraints = [];
    }

    // Export extension state
    exportState() {
        return {
            extensions: Array.from(this.extensions.keys()),
            thermoConstraints: this.thermoConstraints,
            knightConstraints: this.knightConstraints.length,
            kingConstraints: this.kingConstraints.length
        };
    }

    // Import extension state
    importState(state) {
        this.reset();
        if (state.extensions) { state.extensions.forEach(ext => this.extensions.set(ext, true)); }
        if (state.thermoConstraints) { this.thermoConstraints = state.thermoConstraints; }
        if (state.knightConstraints) { this.addKnightsMove(); }
        if (state.kingConstraints) { this.addKingsMove(); }
    }
}
