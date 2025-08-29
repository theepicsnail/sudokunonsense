import { SudokuBoard } from './SudokuBoard';
import { SudokuUI } from './SudokuUI';
import { BasicStrategy, XWingStrategy, HiddenSinglesStrategy, NakedPairsStrategy, NakedTriplesStrategy, PointingPairsStrategy, BoxLineReductionStrategy } from './SudokuRules';
import { SudokuSolver } from './SudokuSolver';
// const _ = 0;
// const exampleNormalPuzzle: (number)[][] = [
//     [5, 3, _, _, 7, _, _, _, _],
//     [6, _, _, 1, 9, 5, _, _, _],
//     [_, 9, 8, _, _, _, _, 6, _],
//     [8, _, _, _, 6, _, _, _, 3],
//     [4, _, _, 8, _, 3, _, _, 1],
//     [7, _, _, _, 2, _, _, _, 6],
//     [_, 6, _, _, _, _, 2, 8, _],
//     [_, _, _, 4, 1, 9, _, _, 5],
//     [_, _, _, _, 8, _, _, 7, 9],
// ];
// const examplePuzzle: (number )[][] = [
//     [6,_,_,_,9,5,_,_,7],
//     [5,4,0,0,0,7,1,0,0],
//     [0,0,2,8,0,0,0,5,0],
//     [8,0,0,0,0,0,0,9,0],
//     [0,0,0,0,7,8,0,0,0],
//     [0,3,0,0,0,0,0,0,8],
//     [0,5,0,0,0,2,3,0,0],
//     [3,0,4,5,0,0,0,2,0],
//     [9,2,0,0,3,0,5,0,4]
// ];
const examplePuzzle = [
    [0, 9, 0, 0, 0, 0, 0, 6, 4],
    [0, 0, 0, 0, 0, 0, 1, 0, 0],
    [2, 0, 0, 0, 1, 4, 0, 0, 5],
    [0, 0, 0, 9, 7, 0, 0, 3, 0],
    [0, 0, 3, 0, 6, 8, 0, 0, 0],
    [0, 8, 0, 0, 2, 0, 0, 0, 0],
    [7, 0, 0, 0, 0, 0, 0, 1, 2],
    [0, 4, 2, 0, 0, 0, 0, 0, 0],
    [0, 5, 0, 0, 0, 3, 4, 0, 0]
];
const boardElement = document.getElementById('sudoku-board');
if (boardElement) {
    const board = new SudokuBoard();
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const value = examplePuzzle[row][col];
            if (value && value > 0) {
                board.setCandidates(row, col, [value]);
                board.setFrozen(row, col, true);
            }
        }
    }
    const ui = new SudokuUI(boardElement);
    ui.setBoard(board);
    const solver = new SudokuSolver(board, [
        new BasicStrategy(),
        new HiddenSinglesStrategy(),
        new NakedPairsStrategy(),
        new NakedTriplesStrategy(),
        new PointingPairsStrategy(),
        new BoxLineReductionStrategy(),
        new XWingStrategy(),
    ]);
    // Attach step button logic to the button in the HTML
    const stepBtn = document.getElementById('step-solver-btn');
    const logList = document.getElementById('solver-log-list');
    let autoStepInterval;
    function doStepAndLog() {
        const change = solver.step();
        ui.render();
        if (logList) {
            let msg = '';
            if (change.changed && 'removeCandidate' in change) {
                const { row, col, value } = change.removeCandidate;
                msg = `Removed <b>${value}</b> from <b>R${row + 1}C${col + 1}</b>`;
            }
            else {
                msg = '<span style="color:#888">No further changes found.</span>';
            }
            const li = document.createElement('li');
            li.innerHTML = msg;
            if (logList.firstChild) {
                logList.insertBefore(li, logList.firstChild);
            }
            else {
                logList.appendChild(li);
            }
        }
        return change;
    }
    if (stepBtn) {
        stepBtn.onclick = () => {
            doStepAndLog();
        };
    }
    const autoStepToggle = document.getElementById('auto-step-toggle');
    if (autoStepToggle) {
        autoStepToggle.onchange = () => {
            if (autoStepToggle.checked) {
                autoStepInterval = window.setInterval(() => {
                    const change = doStepAndLog();
                    if (!change || !change.changed) {
                        autoStepToggle.checked = false;
                        if (autoStepInterval)
                            clearInterval(autoStepInterval);
                    }
                }, 10);
            }
            else {
                if (autoStepInterval)
                    clearInterval(autoStepInterval);
            }
        };
    }
    window.board = board;
    window.ui = ui;
    window.solver = solver;
}
