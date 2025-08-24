/* SudokuExtensions (TypeScript)
   Mirrors `extensions.js` functionality and types; runtime JS remains authoritative.
*/
class SudokuExtensions {
    constructor(board) {
        this.board = board;
        this.extensions = new Map();
        this.thermoConstraints = [];
        this.knightConstraints = [];
        this.kingConstraints = [];
        this.extensionDescriptions = {
            'thermo': { name: 'Thermo Sudoku', description: 'Numbers along a thermometer must increase from the bulb to the tip.', rules: [], difficulty: 'Medium' },
            'knight': { name: "Knight's Move Sudoku", description: 'Numbers cannot repeat in cells that are a knight\'s move away (L-shaped).', rules: [], difficulty: 'Hard' },
            'king': { name: "King's Move Sudoku", description: 'Numbers cannot repeat in cells that are adjacent (including diagonally).', rules: [], difficulty: 'Medium' },
            'box-sum-neighbor': { name: 'Box-Sum Neighbor', description: 'A cell value v cannot be next to any neighbor with value (boxNumber - v).', rules: [], difficulty: 'Medium' }
        };
    }
}
export default SudokuExtensions;
