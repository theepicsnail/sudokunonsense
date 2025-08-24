/* Global SudokuTactics delegator (TypeScript)
   Uses per-tactic classes exposed on window.tacticClasses
*/

import tacticClasses from './tactics/index';

export class SudokuTactics {
    board: any;
    extensions: any;
    tacticDescriptions: any;

    constructor(board: any) {
        this.board = board;
        this.extensions = null;
        this.tacticDescriptions = {
            'naked-single': {
                name: 'Naked Single',
                description: 'A cell that has only one possible candidate remaining. This is the most basic solving technique.',
                difficulty: 'Easy',
                explanation: 'When a cell has only one possible number that can be placed there, that number must be the solution for that cell.'
            },
            'hidden-single': {
                name: 'Hidden Single',
                description: 'A number that can only be placed in one cell within a row, column, or box.',
                difficulty: 'Easy',
                explanation: 'When a number appears as a candidate in only one cell within a row, column, or 3x3 box, that number must be placed in that cell.'
            },
            'single-step-guess': {
                name: 'Single-Step Guess (Contradiction)',
                description: 'Temporarily assume a candidate in a cell. If this immediately causes a contradiction (no candidates in a cell or a digit has no place in a unit), eliminate that candidate.',
                difficulty: 'Medium',
                explanation: 'Try a candidate and propagate constraints once. If the assumption leaves a unit without a place for some digit, that candidate is impossible.'
            }
        };
    }

    setExtensions(extensions: any) {
        this.extensions = extensions;
    }

    executeTactic(tacticName: string) {
        const classes = tacticClasses || {};
        const Klass = classes[tacticName];
        if (!Klass) return { found: false, message: `Unknown tactic: ${tacticName}` };

        const tactic = new Klass(this.board, this.extensions);
        if (typeof tactic.setExtensions === 'function') tactic.setExtensions(this.extensions);
        if (typeof tactic.find === 'function') return tactic.find();
        return { found: false, message: `Tactic ${tacticName} not implemented` };
    }

    getTacticDescription(tacticName: string) {
        return this.tacticDescriptions[tacticName] || { name: 'Unknown', description: 'Unknown', difficulty: 'Unknown', explanation: '' };
    }
}

export default SudokuTactics;
