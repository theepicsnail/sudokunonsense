/* BaseTactic (TypeScript)
   Mirrors `tactics/base_tactic.js` behavior and registers on window.BaseTactic
*/

export class BaseTactic {
    board: any;
    extensions: any;

    constructor(board: any, extensions: any = null) {
        this.board = board;
        this.extensions = extensions;
    }

    setExtensions(ext: any) {
        this.extensions = ext;
    }

    find(): { found: boolean; message: string } {
        return { found: false, message: 'Not implemented' };
    }
}

export default BaseTactic;
