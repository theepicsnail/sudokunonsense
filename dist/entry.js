// Compatibility entry (TypeScript)
// Imports app/core modules and exposes them on window for legacy code paths.
import SudokuBoard from './sudoku';
import SudokuTactics from './tactics';
import SudokuExtensions from './extensions';
import tacticClasses from './tactics/index';
import SudokuApp from './app';
const g = globalThis;
g.SudokuBoard = SudokuBoard;
g.SudokuTactics = SudokuTactics;
g.SudokuExtensions = SudokuExtensions;
g.tacticClasses = tacticClasses;
g.SudokuApp = SudokuApp;
document.addEventListener('DOMContentLoaded', () => {
    try {
        g.sudokuApp = new g.SudokuApp();
    }
    catch (e) {
        // If a runtime implementation provides a richer SudokuApp, it may override; ignore errors.
        // Keep console info for debugging.
        // eslint-disable-next-line no-console
        console.warn('entry.ts: failed to auto-instantiate SudokuApp', e);
    }
});
