// Box-Line Reduction (Claiming) strategy: If all candidates for a digit in a row (or column) are confined to a single box, remove that digit from the rest of the box outside the row (or column)
export class BoxLineReductionStrategy implements SudokuStrategy {
    apply(board: SudokuBoard): BoardChange {
        // For each digit
        for (let digit = 1; digit <= 9; digit++) {
            // Check rows
            for (let row = 0; row < 9; row++) {
                // Find all columns in this row where digit is a candidate
                const cols: number[] = [];
                for (let col = 0; col < 9; col++) {
                    if (board.isFrozen(row, col)) continue;
                    if (board.getCandidates(row, col).has(digit)) {
                        cols.push(col);
                    }
                }
                if (cols.length < 2) continue;
                // Check if all these columns are in the same box
                const boxCol = Math.floor(cols[0] / 3);
                if (cols.every(col => Math.floor(col / 3) === boxCol)) {
                    // Remove digit from other cells in the box outside this row
                    const boxRow = Math.floor(row / 3);
                    for (let dRow = 0; dRow < 3; dRow++) {
                        const r = boxRow * 3 + dRow;
                        if (r === row) continue;
                        for (let dCol = 0; dCol < 3; dCol++) {
                            const c = boxCol * 3 + dCol;
                            if (board.isFrozen(r, c)) continue;
                            if (board.getCandidates(r, c).has(digit)) {
                                return { changed: true, removeCandidate: { row: r, col: c, value: digit } };
                            }
                        }
                    }
                }
            }
            // Check columns
            for (let col = 0; col < 9; col++) {
                // Find all rows in this column where digit is a candidate
                const rows: number[] = [];
                for (let row = 0; row < 9; row++) {
                    if (board.isFrozen(row, col)) continue;
                    if (board.getCandidates(row, col).has(digit)) {
                        rows.push(row);
                    }
                }
                if (rows.length < 2) continue;
                // Check if all these rows are in the same box
                const boxRow = Math.floor(rows[0] / 3);
                if (rows.every(row => Math.floor(row / 3) === boxRow)) {
                    // Remove digit from other cells in the box outside this column
                    const boxCol = Math.floor(col / 3);
                    for (let dRow = 0; dRow < 3; dRow++) {
                        const r = boxRow * 3 + dRow;
                        for (let dCol = 0; dCol < 3; dCol++) {
                            const c = boxCol * 3 + dCol;
                            if (c === col) continue;
                            if (board.isFrozen(r, c)) continue;
                            if (board.getCandidates(r, c).has(digit)) {
                                return { changed: true, removeCandidate: { row: r, col: c, value: digit } };
                            }
                        }
                    }
                }
            }
        }
        return { changed: false };
    }
}
// Pointing Pairs/Triples strategy: If all candidates for a digit in a box are confined to a single row or column, remove that digit from the rest of the row/column outside the box
export class PointingPairsStrategy implements SudokuStrategy {
    apply(board: SudokuBoard): BoardChange {
        // For each digit
        for (let digit = 1; digit <= 9; digit++) {
            // For each box
            for (let boxRow = 0; boxRow < 3; boxRow++) {
                for (let boxCol = 0; boxCol < 3; boxCol++) {
                    // Collect all cells in the box that have this candidate
                    const positions: [number, number][] = [];
                    for (let dRow = 0; dRow < 3; dRow++) {
                        for (let dCol = 0; dCol < 3; dCol++) {
                            const row = boxRow * 3 + dRow;
                            const col = boxCol * 3 + dCol;
                            if (board.isFrozen(row, col)) continue;
                            if (board.getCandidates(row, col).has(digit)) {
                                positions.push([row, col]);
                            }
                        }
                    }
                    if (positions.length < 2) continue; // Only applies for pairs/triples
                    // Check if all positions are in the same row
                    const allRows = positions.map(([row, _]) => row);
                    const allCols = positions.map(([_, col]) => col);
                    const uniqueRows = Array.from(new Set(allRows));
                    const uniqueCols = Array.from(new Set(allCols));
                    if (uniqueRows.length === 1) {
                        // All in the same row: remove from rest of row outside this box
                        const row = uniqueRows[0];
                        for (let col = 0; col < 9; col++) {
                            // Skip columns in this box
                            if (col >= boxCol * 3 && col < boxCol * 3 + 3) continue;
                            if (board.isFrozen(row, col)) continue;
                            if (board.getCandidates(row, col).has(digit)) {
                                return { changed: true, removeCandidate: { row, col, value: digit } };
                            }
                        }
                    }
                    if (uniqueCols.length === 1) {
                        // All in the same column: remove from rest of column outside this box
                        const col = uniqueCols[0];
                        for (let row = 0; row < 9; row++) {
                            if (row >= boxRow * 3 && row < boxRow * 3 + 3) continue;
                            if (board.isFrozen(row, col)) continue;
                            if (board.getCandidates(row, col).has(digit)) {
                                return { changed: true, removeCandidate: { row, col, value: digit } };
                            }
                        }
                    }
                }
            }
        }
        return { changed: false };
    }
}
// Naked Triples strategy: If three cells in a unit (row, col, or box) have only the same three candidates among them, remove those candidates from other cells in the unit
export class NakedTriplesStrategy implements SudokuStrategy {
    apply(board: SudokuBoard): BoardChange {
        // Helper to check a unit (array of [row, col])
        function checkUnit(cells: [number, number][]): BoardChange {
            // Find all cells with 2 or 3 candidates
            for (let i = 0; i < cells.length; i++) {
                const [row1, col1] = cells[i];
                if (board.isFrozen(row1, col1)) continue;
                const cand1 = Array.from(board.getCandidates(row1, col1));
                if (cand1.length < 2 || cand1.length > 3) continue;
                for (let j = i + 1; j < cells.length; j++) {
                    const [row2, col2] = cells[j];
                    if (board.isFrozen(row2, col2)) continue;
                    const cand2 = Array.from(board.getCandidates(row2, col2));
                    if (cand2.length < 2 || cand2.length > 3) continue;
                    for (let k = j + 1; k < cells.length; k++) {
                        const [row3, col3] = cells[k];
                        if (board.isFrozen(row3, col3)) continue;
                        const cand3 = Array.from(board.getCandidates(row3, col3));
                        if (cand3.length < 2 || cand3.length > 3) continue;
                        // Union of all candidates
                        const union = new Set([...cand1, ...cand2, ...cand3]);
                        if (union.size === 3) {
                            // Check if these three cells are the only ones in the unit with any of these candidates
                            for (const [row, col] of cells) {
                                if (board.isFrozen(row, col)) continue;
                                const cands = board.getCandidates(row, col);
                                if ([...union].some(val => cands.has(val))) {
                                    if ((row === row1 && col === col1) || (row === row2 && col === col2) || (row === row3 && col === col3)) {
                                        // part of the triple
                                    } else {
                                        // If another cell has any of these candidates, try to remove
                                        for (const val of union) {
                                            if (cands.has(val)) {
                                                return { changed: true, removeCandidate: { row, col, value: val } };
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return { changed: false };
        }
        // Check all rows
        for (let row = 0; row < 9; row++) {
            const cells: [number, number][] = [];
            for (let col = 0; col < 9; col++) cells.push([row, col]);
            const result = checkUnit(cells);
            if (result.changed) return result;
        }
        // Check all columns
        for (let col = 0; col < 9; col++) {
            const cells: [number, number][] = [];
            for (let row = 0; row < 9; row++) cells.push([row, col]);
            const result = checkUnit(cells);
            if (result.changed) return result;
        }
        // Check all boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const cells: [number, number][] = [];
                for (let dRow = 0; dRow < 3; dRow++) {
                    for (let dCol = 0; dCol < 3; dCol++) {
                        cells.push([boxRow * 3 + dRow, boxCol * 3 + dCol]);
                    }
                }
                const result = checkUnit(cells);
                if (result.changed) return result;
            }
        }
        return { changed: false };
    }
}
// Naked Pairs strategy: If two cells in a unit (row, col, or box) have exactly the same two candidates, remove those candidates from other cells in the unit
export class NakedPairsStrategy implements SudokuStrategy {
    apply(board: SudokuBoard): BoardChange {
        // Helper to check a unit (array of [row, col])
        function checkUnit(cells: [number, number][]): BoardChange {
            const pairs: { pair: number[], positions: [number, number][] }[] = [];
            // Find all cells with exactly 2 candidates
            for (const [row, col] of cells) {
                if (board.isFrozen(row, col)) continue;
                const candidates = Array.from(board.getCandidates(row, col));
                if (candidates.length === 2) {
                    // Check if this pair already exists
                    let found = false;
                    for (const entry of pairs) {
                        if (entry.pair[0] === candidates[0] && entry.pair[1] === candidates[1]) {
                            entry.positions.push([row, col]);
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        pairs.push({ pair: candidates, positions: [[row, col]] });
                    }
                }
            }
            // For each pair that appears in exactly two cells, remove those candidates from other cells in the unit
            for (const entry of pairs) {
                if (entry.positions.length === 2) {
                    for (const [row, col] of cells) {
                        // Skip the naked pair cells
                        if (entry.positions.some(([r, c]) => r === row && c === col)) continue;
                        const candidates = board.getCandidates(row, col);
                        for (const val of entry.pair) {
                            if (candidates.has(val)) {
                                return { changed: true, removeCandidate: { row, col, value: val } };
                            }
                        }
                    }
                }
            }
            return { changed: false };
        }
        // Check all rows
        for (let row = 0; row < 9; row++) {
            const cells: [number, number][] = [];
            for (let col = 0; col < 9; col++) cells.push([row, col]);
            const result = checkUnit(cells);
            if (result.changed) return result;
        }
        // Check all columns
        for (let col = 0; col < 9; col++) {
            const cells: [number, number][] = [];
            for (let row = 0; row < 9; row++) cells.push([row, col]);
            const result = checkUnit(cells);
            if (result.changed) return result;
        }
        // Check all boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const cells: [number, number][] = [];
                for (let dRow = 0; dRow < 3; dRow++) {
                    for (let dCol = 0; dCol < 3; dCol++) {
                        cells.push([boxRow * 3 + dRow, boxCol * 3 + dCol]);
                    }
                }
                const result = checkUnit(cells);
                if (result.changed) return result;
            }
        }
        return { changed: false };
    }
}
// Hidden Singles strategy: If a candidate appears only once in a row, column, or box, it must go there
export class HiddenSinglesStrategy implements SudokuStrategy {
    apply(board: SudokuBoard): BoardChange {
        // Check rows
        for (let row = 0; row < 9; row++) {
            for (let digit = 1; digit <= 9; digit++) {
                let count = 0, lastCol = -1;
                for (let col = 0; col < 9; col++) {
                    if (board.isFrozen(row, col)) continue;
                    if (board.getCandidates(row, col).has(digit)) {
                        count++;
                        lastCol = col;
                    }
                }
                if (count === 1) {
                    // Only one place for digit in this row
                    const candidates = board.getCandidates(row, lastCol);
                    if (candidates.size > 1) {
                        // Remove all other candidates except digit
                        for (const val of Array.from(candidates)) {
                            if (val !== digit) {
                                return { changed: true, removeCandidate: { row, col: lastCol, value: val } };
                            }
                        }
                    }
                }
            }
        }
        // Check columns
        for (let col = 0; col < 9; col++) {
            for (let digit = 1; digit <= 9; digit++) {
                let count = 0, lastRow = -1;
                for (let row = 0; row < 9; row++) {
                    if (board.isFrozen(row, col)) continue;
                    if (board.getCandidates(row, col).has(digit)) {
                        count++;
                        lastRow = row;
                    }
                }
                if (count === 1) {
                    const candidates = board.getCandidates(lastRow, col);
                    if (candidates.size > 1) {
                        for (const val of Array.from(candidates)) {
                            if (val !== digit) {
                                return { changed: true, removeCandidate: { row: lastRow, col, value: val } };
                            }
                        }
                    }
                }
            }
        }
        // Check boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                for (let digit = 1; digit <= 9; digit++) {
                    let count = 0, lastCell: [number, number] = [-1, -1];
                    for (let dRow = 0; dRow < 3; dRow++) {
                        for (let dCol = 0; dCol < 3; dCol++) {
                            const row = boxRow * 3 + dRow;
                            const col = boxCol * 3 + dCol;
                            if (board.isFrozen(row, col)) continue;
                            if (board.getCandidates(row, col).has(digit)) {
                                count++;
                                lastCell = [row, col];
                            }
                        }
                    }
                    if (count === 1) {
                        const [row, col] = lastCell;
                        const candidates = board.getCandidates(row, col);
                        if (candidates.size > 1) {
                            for (const val of Array.from(candidates)) {
                                if (val !== digit) {
                                    return { changed: true, removeCandidate: { row, col, value: val } };
                                }
                            }
                        }
                    }
                }
            }
        }
        return { changed: false };
    }
}
// X-Wing strategy: Looks for X-Wing patterns for each digit in rows and columns
export class XWingStrategy implements SudokuStrategy {
    apply(board: SudokuBoard): BoardChange {
        // Check for X-Wing in rows
        for (let digit = 1; digit <= 9; digit++) {
            // Find all rows where this digit appears exactly in 2 columns
            const rowsWithCols: [number, number[]][] = [];
            for (let row = 0; row < 9; row++) {
                const cols: number[] = [];
                for (let col = 0; col < 9; col++) {
                    if (board.isFrozen(row, col)) continue;
                    if (board.getCandidates(row, col).has(digit)) {
                        cols.push(col);
                    }
                }
                if (cols.length === 2) {
                    rowsWithCols.push([row, cols]);
                }
            }
            // Look for two rows with the same columns
            for (let i = 0; i < rowsWithCols.length; i++) {
                for (let j = i + 1; j < rowsWithCols.length; j++) {
                    const [row1, cols1] = rowsWithCols[i];
                    const [row2, cols2] = rowsWithCols[j];
                    if (cols1[0] === cols2[0] && cols1[1] === cols2[1]) {
                        // Found X-Wing in rows row1 and row2, columns cols1[0] and cols1[1]
                        // Remove digit from other rows in these columns
                        for (const col of cols1) {
                            for (let row = 0; row < 9; row++) {
                                if (row !== row1 && row !== row2 && !board.isFrozen(row, col)) {
                                    if (board.getCandidates(row, col).has(digit)) {
                                        return { changed: true, removeCandidate: { row, col, value: digit } };
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        // Check for X-Wing in columns (transpose logic)
        for (let digit = 1; digit <= 9; digit++) {
            const colsWithRows: [number, number[]][] = [];
            for (let col = 0; col < 9; col++) {
                const rows: number[] = [];
                for (let row = 0; row < 9; row++) {
                    if (board.isFrozen(row, col)) continue;
                    if (board.getCandidates(row, col).has(digit)) {
                        rows.push(row);
                    }
                }
                if (rows.length === 2) {
                    colsWithRows.push([col, rows]);
                }
            }
            for (let i = 0; i < colsWithRows.length; i++) {
                for (let j = i + 1; j < colsWithRows.length; j++) {
                    const [col1, rows1] = colsWithRows[i];
                    const [col2, rows2] = colsWithRows[j];
                    if (rows1[0] === rows2[0] && rows1[1] === rows2[1]) {
                        // Found X-Wing in columns col1 and col2, rows rows1[0] and rows1[1]
                        for (const row of rows1) {
                            for (let col = 0; col < 9; col++) {
                                if (col !== col1 && col !== col2 && !board.isFrozen(row, col)) {
                                    if (board.getCandidates(row, col).has(digit)) {
                                        return { changed: true, removeCandidate: { row, col, value: digit } };
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return { changed: false };
    }
}
// Basic strategy: A number can not repeat in the same row, column, or 3x3 box
export class BasicStrategy implements SudokuStrategy {
    // Returns a single candidate removal if found, else {changed: false}
    apply(board: SudokuBoard): BoardChange {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const candidates = board.getCandidates(row, col);
                if (candidates.size <= 1 || board.isFrozen(row, col)) continue;
                // Remove candidates that are already set in the same row, col, or box
                for (let peer = 0; peer < 9; peer++) {
                    // Row
                    if (peer !== col) {
                        const peerCandidates = board.getCandidates(row, peer);
                        if (peerCandidates.size === 1) {
                            const val = Array.from(peerCandidates)[0];
                            if (candidates.has(val)) {
                                return { changed: true, removeCandidate: { row, col, value: val } };
                            }
                        }
                    }
                    // Column
                    if (peer !== row) {
                        const peerCandidates = board.getCandidates(peer, col);
                        if (peerCandidates.size === 1) {
                            const val = Array.from(peerCandidates)[0];
                            if (candidates.has(val)) {
                                return { changed: true, removeCandidate: { row, col, value: val } };
                            }
                        }
                    }
                }
                // Box
                const boxRow = Math.floor(row / 3) * 3;
                const boxCol = Math.floor(col / 3) * 3;
                for (let r = boxRow; r < boxRow + 3; r++) {
                    for (let c = boxCol; c < boxCol + 3; c++) {
                        if (r === row && c === col) continue;
                        const peerCandidates = board.getCandidates(r, c);
                        if (peerCandidates.size === 1) {
                            const val = Array.from(peerCandidates)[0];
                            if (candidates.has(val)) {
                                return { changed: true, removeCandidate: { row, col, value: val } };
                            }
                        }
                    }
                }
            }
        }
        return { changed: false };
    }
}

import { SudokuBoard } from './SudokuBoard';
export type BoardChange =
    | { changed: false }
    | { changed: true, removeCandidate: { row: number, col: number, value: number } };

export interface SudokuStrategy {
    apply(board: SudokuBoard): BoardChange;
}