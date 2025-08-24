/* Tactic registry (TypeScript)
   Registers available tactic classes on window.tacticClasses
*/

import NakedSingle from './naked_single';
import HiddenSingle from './hidden_single';
import SingleStepGuess from './single_step_guess';

// Fallback placeholders for advanced tactics that are not implemented yet
class NotImplementedTactic {
    find() { return { found: false, message: 'Not implemented' }; }
}

const tacticClasses: Record<string, any> = {
    'naked-single': NakedSingle,
    'hidden-single': HiddenSingle,
    'single-step-guess': SingleStepGuess,
    'x-wing': NotImplementedTactic,
    'swordfish': NotImplementedTactic,
    'xy-wing': NotImplementedTactic,
    'xyz-wing': NotImplementedTactic
};

export default tacticClasses;
