(function () {
    class BaseTactic {
        constructor(board, extensions = null) {
            this.board = board;
            this.extensions = extensions;
        }

        setExtensions(ext) {
            this.extensions = ext;
        }

        // Should be overridden by subclasses
        find() {
            return { found: false, message: 'Not implemented' };
        }
    }

    window.BaseTactic = BaseTactic;
})();
