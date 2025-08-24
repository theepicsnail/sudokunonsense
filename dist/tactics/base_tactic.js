/* BaseTactic (TypeScript)
   Mirrors `tactics/base_tactic.js` behavior and registers on window.BaseTactic
*/
export class BaseTactic {
    constructor(board, extensions = null) {
        this.board = board;
        this.extensions = extensions;
    }
    setExtensions(ext) {
        this.extensions = ext;
    }
    find() {
        return { found: false, message: 'Not implemented' };
    }
}
export default BaseTactic;
