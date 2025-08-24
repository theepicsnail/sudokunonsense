(function () {
    const Base = window.BaseTactic;

    class HiddenSingle extends Base {
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

    window.HiddenSingle = HiddenSingle;
})();
