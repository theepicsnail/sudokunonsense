(function () {
    const Base = window.BaseTactic;
    const Naked = window.NakedSingle;
    const Hidden = window.HiddenSingle;
    const SingleGuess = window.SingleStepGuess;

    class XWing extends Base { find() { return { found: false, message: 'X-Wing not implemented' }; } }
    class Swordfish extends Base { find() { return { found: false, message: 'Swordfish not implemented' }; } }
    class XYWing extends Base { find() { return { found: false, message: 'XY-Wing not implemented' }; } }
    class XYZWing extends Base { find() { return { found: false, message: 'XYZ-Wing not implemented' }; } }

    window.tacticClasses = {
        'naked-single': Naked,
        'hidden-single': Hidden,
        'single-step-guess': SingleGuess,
        'x-wing': XWing,
        'swordfish': Swordfish,
        'xy-wing': XYWing,
        'xyz-wing': XYZWing
    };
})();
