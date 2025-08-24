/* NakedSingle tactic converted to TypeScript
   Keeps behavior identical to the JS version and registers on window.NakedSingle.
*/
import BaseTactic from './base_tactic';
export default class NakedSingle extends BaseTactic {
    constructor(board, extensions = null) { super(board, extensions); this.board = board; this.extensions = extensions; }
    find() {
        const singles = this.board.getNakedSingles();
        if (!singles || singles.length === 0)
            return { found: false, message: 'No naked singles' };
        const result = singles[0];
        this.board.setValue(result.row, result.col, result.value);
        return { found: true, message: `Found naked single: ${result.value} at (${result.row + 1}, ${result.col + 1})`, changes: [{ row: result.row, col: result.col, value: result.value, type: 'naked-single' }] };
    }
}
