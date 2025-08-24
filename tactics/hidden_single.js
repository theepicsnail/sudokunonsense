/* HiddenSingle tactic converted to TypeScript
   This file is a typed source version of `tactics/hidden_single.js`.
   It intentionally keeps behavior identical and registers the class on window.HiddenSingle
   so existing runtime code continues to work (the original JS file is left in place).
*/
import BaseTactic from './base_tactic';
export default class HiddenSingle extends BaseTactic {
    constructor(board, extensions = null) {
        super(board, extensions);
        this.board = board;
        this.extensions = extensions;
    }
    find() {
        const singles = this.board.getHiddenSingles();
        if (!singles || singles.length === 0) {
            return { found: false, message: 'No hidden singles' };
        }
        const result = singles[0];
        this.board.setValue(result.row, result.col, result.value);
        return {
            found: true,
            message: `Found hidden single: ${result.value} at (${result.row + 1}, ${result.col + 1}) in ${result.type}`,
            changes: [{ row: result.row, col: result.col, value: result.value, type: 'hidden-single', context: result.type }]
        };
    }
}
