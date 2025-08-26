(() => {
  // src/sudoku.ts
  var SudokuBoard = class {
    constructor() {
      this.board = Array(9).fill(null).map(() => Array(9).fill(0));
      this.initialBoard = Array(9).fill(null).map(() => Array(9).fill(0));
      this.candidates = Array(9).fill(null).map(() => Array(9).fill(null).map(() => /* @__PURE__ */ new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])));
      this.bannedCandidates = Array(9).fill(null).map(() => Array(9).fill(null).map(() => /* @__PURE__ */ new Set()));
      this.solvingHistory = [];
      this.currentStep = 0;
    }
    loadPuzzle(puzzle) {
      this.board = puzzle.map((row) => [...row]);
      this.initialBoard = puzzle.map((row) => [...row]);
      this.resetCandidates();
      this.clearAllBans();
      this.solvingHistory = [];
      this.currentStep = 0;
      this.updateCandidates();
    }
    resetCandidates() {
      this.candidates = Array(9).fill(null).map(() => Array(9).fill(null).map(() => /* @__PURE__ */ new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])));
    }
    clearAllBans() {
      this.bannedCandidates = Array(9).fill(null).map(() => Array(9).fill(null).map(() => /* @__PURE__ */ new Set()));
    }
    enforceBans() {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (this.board[r][c] !== 0) continue;
          for (const val of this.bannedCandidates[r][c]) {
            this.candidates[r][c].delete(val);
          }
        }
      }
    }
    updateCandidates() {
      this.resetCandidates();
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (this.board[row][col] !== 0) {
            this.candidates[row][col].clear();
            this.removeCandidateFromPeers(row, col, this.board[row][col]);
          }
        }
      }
      this.enforceBans();
    }
    removeCandidateFromPeers(row, col, value) {
      for (let c = 0; c < 9; c++) {
        if (c !== col) this.candidates[row][c].delete(value);
      }
      for (let r = 0; r < 9; r++) {
        if (r !== row) this.candidates[r][col].delete(value);
      }
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          if (r !== row || c !== col) this.candidates[r][c].delete(value);
        }
      }
    }
    banCandidate(row, col, value) {
      if (value < 1 || value > 9) return;
      this.bannedCandidates[row][col].add(value);
      this.candidates[row][col].delete(value);
    }
    setValue(row, col, value) {
      if (this.initialBoard[row][col] !== 0) return false;
      this.board[row][col] = value;
      this.candidates[row][col].clear();
      this.bannedCandidates[row][col].clear();
      if (value !== 0) this.removeCandidateFromPeers(row, col, value);
      else this.updateCandidates();
      return true;
    }
    getValue(row, col) {
      return this.board[row][col];
    }
    getCandidates(row, col) {
      return Array.from(this.candidates[row][col]);
    }
    isValid(row, col, value) {
      if (value === 0) return true;
      for (let c = 0; c < 9; c++) if (c !== col && this.board[row][c] === value) return false;
      for (let r = 0; r < 9; r++) if (r !== row && this.board[r][col] === value) return false;
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          if ((r !== row || c !== col) && this.board[r][c] === value) return false;
        }
      }
      return true;
    }
    isBoardValid() {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (this.board[row][col] !== 0 && !this.isValid(row, col, this.board[row][col])) return false;
        }
      }
      return true;
    }
    isComplete() {
      for (let row = 0; row < 9; row++) for (let col = 0; col < 9; col++) if (this.board[row][col] === 0) return false;
      return this.isBoardValid();
    }
    getRow(row) {
      return this.board[row];
    }
    getColumn(col) {
      return this.board.map((r) => r[col]);
    }
    getBox(boxRow, boxCol) {
      const cells = [];
      const startRow = boxRow * 3;
      const startCol = boxCol * 3;
      for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
          cells.push({ row: r, col: c, value: this.board[r][c] });
        }
      }
      return cells;
    }
    getEmptyCells() {
      const empty = [];
      for (let row = 0; row < 9; row++) for (let col = 0; col < 9; col++) if (this.board[row][col] === 0) empty.push({ row, col });
      return empty;
    }
    reset() {
      this.board = this.initialBoard.map((row) => [...row]);
      this.clearAllBans();
      this.updateCandidates();
      this.solvingHistory = [];
      this.currentStep = 0;
    }
    toString() {
      return this.board.map((row) => row.join(" ")).join("\n");
    }
    loadFromString(str) {
      const lines = str.trim().split("\n");
      const puzzle = [];
      for (let line of lines) {
        const row = line.split(/\s+/).map((cell) => {
          const val = parseInt(cell);
          return isNaN(val) ? 0 : val;
        });
        puzzle.push(row);
      }
      this.loadPuzzle(puzzle);
    }
    loadFromCode(code) {
      if (typeof code !== "string") throw new Error("Code must be a string");
      const digits = code.replace(/\s+/g, "");
      if (!/^\d{81}$/.test(digits)) throw new Error("Code must be exactly 81 digits (0-9)");
      const puzzle = [];
      for (let r = 0; r < 9; r++) {
        const row = [];
        for (let c = 0; c < 9; c++) {
          const ch = digits[r * 9 + c];
          row.push(parseInt(ch, 10));
        }
        puzzle.push(row);
      }
      this.loadPuzzle(puzzle);
    }
    getExamplePuzzle() {
      return [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ];
    }
  };
  var sudoku_default = SudokuBoard;

  // src/tactics/base_tactic.ts
  var BaseTactic = class {
    constructor(board, extensions = null) {
      this.board = board;
      this.extensions = extensions;
    }
    setExtensions(ext) {
      this.extensions = ext;
    }
    find() {
      return { found: false, message: "Not implemented" };
    }
  };
  var base_tactic_default = BaseTactic;

  // src/tactics/naked_single.ts
  var NakedSingle = class extends base_tactic_default {
    constructor(board, extensions = null) {
      super(board, extensions);
      this.board = board;
      this.extensions = extensions;
    }
    find() {
      const singles = getNakedSinglesFromBoard(this.board);
      if (!singles || singles.length === 0) return { found: false, message: "No naked singles" };
      const result = singles[0];
      this.board.setValue(result.row, result.col, result.value);
      return { found: true, message: `Found naked single: ${result.value} at (${result.row + 1}, ${result.col + 1})`, changes: [{ row: result.row, col: result.col, value: result.value, type: "naked-single" }] };
    }
  };
  function getNakedSinglesFromBoard(board) {
    const singles = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board.board[row][col] === 0 && board.candidates[row][col].size === 1) {
          singles.push({ row, col, value: Number(Array.from(board.candidates[row][col])[0]) });
        }
      }
    }
    return singles;
  }

  // src/tactics/hidden_single.ts
  var HiddenSingle = class extends base_tactic_default {
    constructor(board, extensions = null) {
      super(board, extensions);
      this.board = board;
      this.extensions = extensions;
    }
    find() {
      const singles = getHiddenSinglesFromBoard(this.board);
      if (!singles || singles.length === 0) {
        return { found: false, message: "No hidden singles" };
      }
      const result = singles[0];
      this.board.setValue(result.row, result.col, result.value);
      return {
        found: true,
        message: `Found hidden single: ${result.value} at (${result.row + 1}, ${result.col + 1}) in ${result.type}`,
        changes: [{ row: result.row, col: result.col, value: result.value, type: "hidden-single", context: result.type }]
      };
    }
  };
  function getHiddenSinglesFromBoard(board) {
    const singles = [];
    for (let row = 0; row < 9; row++) {
      const candidates = getRowCandidates(board, row);
      for (let value = 1; value <= 9; value++) {
        if ((candidates[value] || []).length === 1) {
          singles.push({ row, col: (candidates[value] || [0])[0], value, type: "row" });
        }
      }
    }
    for (let col = 0; col < 9; col++) {
      const candidates = getColumnCandidates(board, col);
      for (let value = 1; value <= 9; value++) {
        if ((candidates[value] || []).length === 1) {
          singles.push({ row: (candidates[value] || [0])[0], col, value, type: "column" });
        }
      }
    }
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const candidates = getBoxCandidates(board, boxRow, boxCol);
        for (let value = 1; value <= 9; value++) {
          if ((candidates[value] || []).length === 1) {
            const pos = (candidates[value] || [{ row: 0, col: 0 }])[0];
            singles.push({ row: pos.row, col: pos.col, value, type: "box" });
          }
        }
      }
    }
    return singles;
  }
  function getRowCandidates(board, row) {
    const candidates = {};
    for (let value = 1; value <= 9; value++) candidates[value] = [];
    for (let col = 0; col < 9; col++) {
      if (board.board[row][col] === 0) {
        for (const value of board.getCandidates ? board.getCandidates(row, col) : board.candidates[row][col]) candidates[value].push(col);
      }
    }
    return candidates;
  }
  function getColumnCandidates(board, col) {
    const candidates = {};
    for (let value = 1; value <= 9; value++) candidates[value] = [];
    for (let row = 0; row < 9; row++) {
      if (board.board[row][col] === 0) {
        for (const value of board.getCandidates ? board.getCandidates(row, col) : board.candidates[row][col]) candidates[value].push(row);
      }
    }
    return candidates;
  }
  function getBoxCandidates(board, boxRow, boxCol) {
    const candidates = {};
    for (let value = 1; value <= 9; value++) candidates[value] = [];
    const startRow = boxRow * 3;
    const startCol = boxCol * 3;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (board.board[r][c] === 0) {
          for (const value of board.getCandidates ? board.getCandidates(r, c) : board.candidates[r][c]) candidates[value].push({ row: r, col: c });
        }
      }
    }
    return candidates;
  }

  // src/tactics/single_step_guess.ts
  var SingleStepGuess = class extends base_tactic_default {
    constructor(board, extensions = null) {
      super(board, extensions);
      this.board = board;
      this.extensions = extensions;
    }
    find() {
      const useExtensions = !!this.extensions;
      const exported = useExtensions && this.extensions.exportState ? this.extensions.exportState() : null;
      const emptyCells = this.board.getEmptyCells();
      for (const { row, col } of emptyCells) {
        const cands = this.board.getCandidates(row, col);
        for (const candidate of cands) {
          const cloned = this.cloneBoard(this.board);
          cloned.setValue(row, col, candidate);
          if (useExtensions && this.extensions && this.extensions.importState) {
            try {
              this.extensions.importState(exported);
            } catch (e) {
            }
          }
          if (cloned.updateCandidates) cloned.updateCandidates();
          const contradiction = this.detectImmediateContradiction(cloned);
          if (contradiction) {
            if (this.board.removeCandidate) this.board.removeCandidate(row, col, candidate);
            return { found: true, message: `Eliminated candidate ${candidate} at (${row + 1}, ${col + 1}) by contradiction`, changes: [{ row, col, removed: [candidate], type: "single-step-guess" }] };
          }
        }
      }
      return { found: false, message: "No contradiction-based eliminations found" };
    }
    cloneBoard(sourceBoard) {
      try {
        const b = new sourceBoard.constructor();
        b.board = sourceBoard.board.map((r) => Array.isArray(r) ? [...r] : r);
        b.initialBoard = (sourceBoard.initialBoard || []).map((r) => Array.isArray(r) ? [...r] : r);
        if (b.updateCandidates) b.updateCandidates();
        return b;
      } catch (e) {
        return JSON.parse(JSON.stringify(sourceBoard));
      }
    }
    detectImmediateContradiction(testBoard) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (!testBoard.getValue(r, c) && testBoard.getCandidates(r, c).length === 0) return { type: "empty-cell", row: r, col: c };
        }
      }
      for (let r = 0; r < 9; r++) {
        for (let d = 1; d <= 9; d++) {
          if (!testBoard.rowHasValue(r, d) && testBoard.countCandidatePlacesInRow(r, d) === 0) return { type: "row-no-place", row: r, digit: d };
        }
      }
      for (let c = 0; c < 9; c++) {
        for (let d = 1; d <= 9; d++) {
          if (!testBoard.colHasValue(c, d) && testBoard.countCandidatePlacesInCol(c, d) === 0) return { type: "col-no-place", col: c, digit: d };
        }
      }
      for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
          for (let d = 1; d <= 9; d++) {
            if (!testBoard.boxHasValue(br, bc, d) && testBoard.countCandidatePlacesInBox(br, bc, d) === 0) return { type: "box-no-place", boxRow: br, boxCol: bc, digit: d };
          }
        }
      }
      return null;
    }
  };

  // src/tactics/index.ts
  var NotImplementedTactic = class {
    find() {
      return { found: false, message: "Not implemented" };
    }
  };
  var tacticClasses = {
    "naked-single": NakedSingle,
    "hidden-single": HiddenSingle,
    "single-step-guess": SingleStepGuess,
    "x-wing": NotImplementedTactic,
    "swordfish": NotImplementedTactic,
    "xy-wing": NotImplementedTactic,
    "xyz-wing": NotImplementedTactic
  };
  var tactics_default = tacticClasses;

  // src/tactics.ts
  var SudokuTactics = class {
    constructor(board) {
      this.board = board;
      this.extensions = null;
      this.tacticDescriptions = {
        "naked-single": {
          name: "Naked Single",
          description: "A cell that has only one possible candidate remaining. This is the most basic solving technique.",
          difficulty: "Easy",
          explanation: "When a cell has only one possible number that can be placed there, that number must be the solution for that cell."
        },
        "hidden-single": {
          name: "Hidden Single",
          description: "A number that can only be placed in one cell within a row, column, or box.",
          difficulty: "Easy",
          explanation: "When a number appears as a candidate in only one cell within a row, column, or 3x3 box, that number must be placed in that cell."
        },
        "single-step-guess": {
          name: "Single-Step Guess (Contradiction)",
          description: "Temporarily assume a candidate in a cell. If this immediately causes a contradiction (no candidates in a cell or a digit has no place in a unit), eliminate that candidate.",
          difficulty: "Medium",
          explanation: "Try a candidate and propagate constraints once. If the assumption leaves a unit without a place for some digit, that candidate is impossible."
        }
      };
    }
    setExtensions(extensions) {
      this.extensions = extensions;
    }
    executeTactic(tacticName) {
      const classes = tactics_default || {};
      const Klass = classes[tacticName];
      if (!Klass) return { found: false, message: `Unknown tactic: ${tacticName}` };
      const tactic = new Klass(this.board, this.extensions);
      if (typeof tactic.setExtensions === "function") tactic.setExtensions(this.extensions);
      if (typeof tactic.find === "function") return tactic.find();
      return { found: false, message: `Tactic ${tacticName} not implemented` };
    }
    getTacticDescription(tacticName) {
      return this.tacticDescriptions[tacticName] || { name: "Unknown", description: "Unknown", difficulty: "Unknown", explanation: "" };
    }
  };
  var tactics_default2 = SudokuTactics;

  // src/extensions.ts
  var SudokuExtensions = class {
    constructor(board) {
      this.board = board;
      this.extensions = /* @__PURE__ */ new Map();
      this.thermoConstraints = [];
      this.knightConstraints = [];
      this.kingConstraints = [];
      this.extensionDescriptions = {
        "thermo": { name: "Thermo Sudoku", description: "Numbers along a thermometer must increase from the bulb to the tip.", rules: [], difficulty: "Medium" },
        "knight": { name: "Knight's Move Sudoku", description: "Numbers cannot repeat in cells that are a knight's move away (L-shaped).", rules: [], difficulty: "Hard" },
        "king": { name: "King's Move Sudoku", description: "Numbers cannot repeat in cells that are adjacent (including diagonally).", rules: [], difficulty: "Medium" },
        "box-sum-neighbor": { name: "Box-Sum Neighbor", description: "A cell value v cannot be next to any neighbor with value (boxNumber - v).", rules: [], difficulty: "Medium" }
      };
    }
    // ...Detailed methods exist in runtime JS; TS file provides typings and minimal stubs.
  };
  var extensions_default = SudokuExtensions;

  // src/app.ts
  var SudokuApp = class {
    constructor() {
      this.lastUnitIssueKeys = null;
      // DOM references
      this.puzzleGrid = null;
      this.tacticSelect = null;
      this.tacticDescription = null;
      this.solvingLog = null;
      this.extensionInfo = null;
      this.cells = [];
      this.board = new sudoku_default();
      this.tactics = new tactics_default2(this.board);
      this.extensions = new extensions_default(this.board);
      this.tactics.setExtensions(this.extensions);
      this.solvingHistory = [];
      this.currentStep = 0;
      this.autoSolving = false;
      this.autoSolveInterval = null;
      this.lastConflictKeys = /* @__PURE__ */ new Set();
      this.lastNoCandKeys = /* @__PURE__ */ new Set();
      this.autoTacticOrder = [
        "naked-single",
        "hidden-single",
        "pointing-pair",
        "box-line-reduction",
        "naked-pair",
        "hidden-pair",
        "x-wing",
        "swordfish",
        "xy-wing",
        "xyz-wing",
        "single-step-guess"
      ];
      this.initializeUI();
      this.bindEvents();
      this.loadExamplePuzzle();
    }
    initializeUI() {
      this.puzzleGrid = document.getElementById("puzzleGrid");
      this.tacticSelect = document.getElementById("tacticSelect");
      this.tacticDescription = document.getElementById("tacticDescription");
      this.solvingLog = document.getElementById("solvingLog");
      this.extensionInfo = document.getElementById("extensionInfo");
      this.createSudokuGrid();
      this.updateTacticDescription();
      this.updateExtensionInfo();
    }
    createSudokuGrid() {
      if (!this.puzzleGrid) return;
      this.puzzleGrid.innerHTML = "";
      this.cells = [];
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const cell = document.createElement("div");
          cell.className = "cell";
          cell.dataset.row = String(row);
          cell.dataset.col = String(col);
          const input = document.createElement("input");
          input.type = "text";
          input.className = "cell-input";
          input.maxLength = 1;
          input.inputMode = "numeric";
          const candidates = document.createElement("div");
          candidates.className = "candidates";
          for (let n = 1; n <= 9; n++) {
            const span = document.createElement("div");
            span.className = "candidate";
            candidates.appendChild(span);
          }
          if (col === 2 || col === 5) {
            cell.style.borderRight = "2px solid #333";
          }
          if (row === 2 || row === 5) {
            cell.style.borderBottom = "2px solid #333";
          }
          cell.appendChild(input);
          cell.appendChild(candidates);
          this.puzzleGrid.appendChild(cell);
          this.cells.push(cell);
          input.addEventListener("input", (e) => this.handleCellInput(e, row, col));
          input.addEventListener("keydown", (e) => this.handleCellKeydown(e, row, col));
          input.addEventListener("focus", () => this.handleCellFocus(row, col));
          input.addEventListener("blur", () => this.handleCellBlur(row, col));
        }
      }
    }
    bindEvents() {
      const el = (id) => document.getElementById(id);
      el("clearBtn")?.addEventListener("click", () => this.clearBoard());
      el("loadExampleBtn")?.addEventListener("click", () => this.loadExamplePuzzle());
      el("validateBtn")?.addEventListener("click", () => this.validateBoard());
      el("stepBtn")?.addEventListener("click", () => this.executeStep());
      el("autoSolveBtn")?.addEventListener("click", () => this.toggleAutoSolve());
      el("resetBtn")?.addEventListener("click", () => this.resetBoard());
      this.tacticSelect?.addEventListener("change", () => this.updateTacticDescription());
      el("addThermoBtn")?.addEventListener("click", () => this.addThermoSudoku());
      el("addKnightBtn")?.addEventListener("click", () => this.addKnightsMove());
      el("addKingBtn")?.addEventListener("click", () => this.addKingsMove());
      el("addBoxSumNeighborBtn")?.addEventListener("click", () => this.addBoxSumNeighbor());
      el("clearExtensionsBtn")?.addEventListener("click", () => this.clearExtensions());
      el("loadCodeBtn")?.addEventListener("click", () => this.loadFromCodeInput());
    }
    handleCellInput(event, row, col) {
      const inputEl = event.target;
      const raw = (inputEl.value || "").replace(/[^1-9]/g, "");
      inputEl.value = raw;
      const val = raw === "" ? 0 : parseInt(raw, 10);
      if (val !== 0 && this.extensions.getActiveExtensions && this.extensions.getActiveExtensions().length > 0) {
        if (this.extensions.validateMove && !this.extensions.validateMove(row, col, val)) {
          inputEl.value = "";
          this.logMessage("Move violates constraints", "error");
          return;
        }
      }
      this.board.setValue(row, col, val);
      this.updateCellDisplay(row, col);
      this.updateCandidates();
    }
    handleCellKeydown(event, row, col) {
      if (event.key === "Backspace" || event.key === "Delete") {
        this.board.setValue(row, col, 0);
        this.updateCellDisplay(row, col);
        this.updateCandidates();
      }
    }
    handleCellFocus(row, col) {
      this.highlightRelatedCells(row, col);
    }
    handleCellBlur(row, col) {
      this.clearHighlights();
    }
    highlightRelatedCells(row, col) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const cell = this.getCellElement(r, c);
          if (r === row || c === col || Math.floor(r / 3) === Math.floor(row / 3) && Math.floor(c / 3) === Math.floor(col / 3)) {
            cell.classList.add("highlighted");
          }
        }
      }
    }
    clearHighlights() {
      this.cells.forEach((cell) => cell.classList.remove("highlighted"));
    }
    getCellElement(row, col) {
      return this.cells[row * 9 + col];
    }
    updateCellDisplay(row, col) {
      const cell = this.getCellElement(row, col);
      const input = cell.querySelector(".cell-input");
      const value = this.board.getValue(row, col);
      const isInitial = this.board.initialBoard[row][col] !== 0;
      input.value = value ? String(value) : "";
      input.readOnly = isInitial && value !== 0;
      cell.classList.remove("initial", "solved", "has-value", "conflict", "nocands");
      if (isInitial) cell.classList.add("initial");
      if (value !== 0) {
        cell.classList.add("solved", "has-value");
      }
      this.renderCandidatesForCell(row, col);
    }
    updateBoardDisplay() {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          this.updateCellDisplay(row, col);
        }
      }
    }
    updateCandidates() {
      if (this.board.updateCandidates) this.board.updateCandidates();
      if (this.extensions.getActiveExtensions && this.extensions.getActiveExtensions().length > 0) {
        if (this.extensions.updateCandidatesWithExtensions) this.extensions.updateCandidatesWithExtensions();
      }
      this.renderAllCandidates();
      this.checkConflicts();
    }
    renderAllCandidates() {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          this.renderCandidatesForCell(row, col);
        }
      }
    }
    renderCandidatesForCell(row, col) {
      const cell = this.getCellElement(row, col);
      const overlay = cell.querySelector(".candidates");
      const value = this.board.getValue(row, col);
      const spans = overlay.children;
      if (value !== 0) {
        for (let i = 0; i < 9; i++) spans[i].textContent = "";
        return;
      }
      const candidates = this.board.getCandidates(row, col);
      for (let n = 1; n <= 9; n++) {
        const idx = n - 1;
        spans[idx].textContent = candidates.includes(n) ? String(n) : "";
      }
    }
    clearBoard() {
      this.board = new this.board.constructor();
      this.tactics = new this.tactics.constructor(this.board);
      this.extensions = new this.extensions.constructor(this.board);
      this.tactics.setExtensions(this.extensions);
      this.solvingHistory = [];
      this.currentStep = 0;
      this.lastConflictKeys.clear();
      this.lastNoCandKeys.clear();
      this.updateBoardDisplay();
      this.clearHighlights();
      this.logMessage("Board cleared", "info");
    }
    async loadExamplePuzzle() {
      try {
        const resp = await fetch("examp.e.json");
        if (resp && resp.ok) {
          const data = await resp.json();
          this.board.loadPuzzle(data);
          this.updateBoardDisplay();
          this.updateCandidates();
          this.logMessage("Example puzzle loaded from examp.e.json", "success");
          return;
        }
      } catch (e) {
      }
      if (this.board.getExamplePuzzle) {
        try {
          const examplePuzzle = this.board.getExamplePuzzle();
          this.board.loadPuzzle(examplePuzzle);
          this.updateBoardDisplay();
          this.updateCandidates();
          this.logMessage("Example puzzle loaded", "success");
          return;
        } catch (e) {
          this.logMessage("Failed to load example puzzle", "error");
          return;
        }
      }
      this.logMessage("No example puzzle available", "warning");
    }
    validateBoard() {
      if (this.board.isBoardValid()) {
        if (this.board.isComplete()) {
          this.logMessage("Puzzle is complete and valid!", "success");
        } else {
          this.logMessage("Puzzle is valid but incomplete", "warning");
        }
      } else {
        this.logMessage("Puzzle has errors", "error");
      }
    }
    executeStep() {
      const selectedTactic = this.tacticSelect?.value || "";
      const result = this.tactics.executeTactic(selectedTactic);
      if (result && result.found) {
        this.solvingHistory.push({ tactic: selectedTactic, result, timestamp: /* @__PURE__ */ new Date() });
        this.updateBoardDisplay();
        if (this.board.updateCandidates) this.board.updateCandidates();
        if (this.extensions.getActiveExtensions && this.extensions.getActiveExtensions().length > 0) {
          if (this.extensions.updateCandidatesWithExtensions) this.extensions.updateCandidatesWithExtensions();
        }
        if (result.changes) this.applyCandidateEliminations(result.changes);
        this.renderAllCandidates();
        this.checkConflicts();
        this.logMessage(result.message, "success");
        if (result.changes) {
          this.highlightChanges(result.changes);
        }
        if (this.board.isComplete && this.board.isComplete()) {
          this.logMessage("Puzzle solved!", "success");
          this.stopAutoSolve();
        }
      } else {
        this.logMessage(result ? result.message : "Tactic returned no result", "warning");
      }
    }
    applyCandidateEliminations(changes) {
      let any = false;
      const toArray = (val) => Array.isArray(val) ? val : val != null ? [val] : [];
      changes.forEach((change) => {
        const { row, col } = change;
        const removed = new Set([
          ...toArray(change.removed),
          ...toArray(change.value),
          ...toArray(change.values)
        ].filter((v) => typeof v === "number"));
        if (removed.size === 0) return;
        if (this.board.getValue(row, col) !== 0) return;
        removed.forEach((val) => {
          this.board.banCandidate(row, col, val);
          any = true;
        });
      });
      if (any) {
        if (this.extensions.getActiveExtensions && this.extensions.getActiveExtensions().length > 0) {
          if (this.extensions.updateCandidatesWithExtensions) this.extensions.updateCandidatesWithExtensions();
        }
        this.renderAllCandidates();
      }
      return any;
    }
    highlightChanges(changes) {
      this.clearHighlights();
      changes.forEach((change) => {
        const cell = this.getCellElement(change.row, change.col);
        cell.classList.add("highlighted");
        setTimeout(() => cell.classList.remove("highlighted"), 2e3);
      });
    }
    toggleAutoSolve() {
      this.autoSolving ? this.stopAutoSolve() : this.startAutoSolve();
    }
    startAutoSolve() {
      this.autoSolving = true;
      const btn = document.getElementById("autoSolveBtn");
      if (btn) {
        btn.textContent = "Stop Auto Solve";
        btn.classList.remove("btn-success");
        btn.classList.add("btn-warning");
      }
      this.autoSolveInterval = setInterval(() => {
        this.runAutoStep();
      }, 600);
    }
    runAutoStep() {
      for (const tactic of this.autoTacticOrder) {
        const beforeBoard = JSON.stringify(this.board.board);
        const result = this.tactics.executeTactic(tactic);
        if (!result || !result.found) continue;
        const afterBoard = JSON.stringify(this.board.board);
        const boardChanged = beforeBoard !== afterBoard;
        if (boardChanged) {
          this.updateCandidates();
        }
        let appliedElims = false;
        if (result.changes) {
          appliedElims = this.applyCandidateEliminations(result.changes);
        }
        if (!boardChanged && !appliedElims) continue;
        this.solvingHistory.push({ tactic, result, timestamp: /* @__PURE__ */ new Date() });
        this.updateBoardDisplay();
        this.renderAllCandidates();
        this.checkConflicts();
        this.logMessage(result.message, "success");
        if (result.changes) this.highlightChanges(result.changes);
        if (this.board.isComplete && this.board.isComplete()) {
          this.logMessage("Puzzle solved!", "success");
          this.stopAutoSolve();
        }
        return true;
      }
      this.logMessage("No tactic made progress. Auto-solve paused.", "warning");
      this.stopAutoSolve();
      return false;
    }
    stopAutoSolve() {
      this.autoSolving = false;
      const btn = document.getElementById("autoSolveBtn");
      if (btn) {
        btn.textContent = "Auto Solve";
        btn.classList.remove("btn-warning");
        btn.classList.add("btn-success");
      }
      if (this.autoSolveInterval) {
        clearInterval(this.autoSolveInterval);
        this.autoSolveInterval = null;
      }
    }
    resetBoard() {
      if (this.board.reset) this.board.reset();
      this.solvingHistory = [];
      this.currentStep = 0;
      this.lastConflictKeys.clear();
      this.lastNoCandKeys.clear();
      this.updateBoardDisplay();
      this.updateCandidates();
      this.clearHighlights();
      this.logMessage("Board reset to initial state", "info");
    }
    updateTacticDescription() {
      const selectedTactic = this.tacticSelect?.value || "";
      const description = this.tactics.getTacticDescription(selectedTactic);
      if (!this.tacticDescription) return;
      this.tacticDescription.innerHTML = `
            <h4>${description.name}</h4>
            <p><strong>Difficulty:</strong> ${description.difficulty}</p>
            <p>${description.description}</p>
            <p><strong>How it works:</strong> ${description.explanation}</p>
        `;
    }
    addThermoSudoku() {
      const thermoPaths = this.extensions.getExampleThermoPaths();
      const result = this.extensions.addThermoSudoku(thermoPaths);
      if (result.success) {
        this.updateCandidates();
        this.updateExtensionInfo();
        this.logMessage(result.message, "success");
      }
    }
    addKnightsMove() {
      const result = this.extensions.addKnightsMove();
      if (result.success) {
        this.updateCandidates();
        this.updateExtensionInfo();
        this.logMessage(result.message, "success");
      }
    }
    addKingsMove() {
      const result = this.extensions.addKingsMove();
      if (result.success) {
        this.updateCandidates();
        this.updateExtensionInfo();
        this.logMessage(result.message, "success");
      }
    }
    addBoxSumNeighbor() {
      const result = this.extensions.addBoxSumNeighbor();
      if (result.success) {
        this.updateCandidates();
        this.updateExtensionInfo();
        this.logMessage(result.message, "success");
      }
    }
    clearExtensions() {
      const result = this.extensions.clearExtensions();
      if (result.success) {
        this.updateCandidates();
        this.updateExtensionInfo();
        this.logMessage(result.message, "success");
      }
    }
    updateExtensionInfo() {
      const active = this.extensions.getActiveExtensions ? this.extensions.getActiveExtensions() : [];
      if (!this.extensionInfo) return;
      if (active.length === 0) {
        this.extensionInfo.innerHTML = "<p>No extensions active. Add custom rules to enhance the puzzle.</p>";
        return;
      }
      let html = "<h4>Active Extensions:</h4><ul>";
      active.forEach((ext) => {
        const desc = this.extensions.getExtensionDescription(ext);
        const count = this.extensions.getConstraintCount(ext);
        html += `<li><strong>${desc.name}</strong> (${desc.difficulty})<br><small>${desc.description}</small><br><small>Constraints: ${count}</small></li>`;
      });
      html += "</ul>";
      this.extensionInfo.innerHTML = html;
    }
    // CONFLICT CHECKING
    checkConflicts() {
      const conflictKeys = /* @__PURE__ */ new Set();
      const noCandKeys = /* @__PURE__ */ new Set();
      const unitIssueKeys = /* @__PURE__ */ new Set();
      for (let r = 0; r < 9; r++) {
        const map = /* @__PURE__ */ new Map();
        for (let c = 0; c < 9; c++) {
          const v = this.board.getValue(r, c);
          if (v === 0) continue;
          const arr = map.get(v) || [];
          arr.push([r, c]);
          map.set(v, arr);
        }
        for (const [, positions] of map) {
          if (positions.length > 1) positions.forEach(([rr, cc]) => conflictKeys.add(`${rr},${cc}`));
        }
      }
      for (let c = 0; c < 9; c++) {
        const map = /* @__PURE__ */ new Map();
        for (let r = 0; r < 9; r++) {
          const v = this.board.getValue(r, c);
          if (v === 0) continue;
          const arr = map.get(v) || [];
          arr.push([r, c]);
          map.set(v, arr);
        }
        for (const [, positions] of map) {
          if (positions.length > 1) positions.forEach(([rr, cc]) => conflictKeys.add(`${rr},${cc}`));
        }
      }
      for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
          const map = /* @__PURE__ */ new Map();
          for (let r = br * 3; r < br * 3 + 3; r++) {
            for (let c = bc * 3; c < bc * 3 + 3; c++) {
              const v = this.board.getValue(r, c);
              if (v === 0) continue;
              const arr = map.get(v) || [];
              arr.push([r, c]);
              map.set(v, arr);
            }
          }
          for (const [, positions] of map) {
            if (positions.length > 1) positions.forEach(([rr, cc]) => conflictKeys.add(`${rr},${cc}`));
          }
        }
      }
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (this.board.getValue(r, c) === 0 && this.board.candidates[r][c].size === 0) {
            noCandKeys.add(`${r},${c}`);
          }
        }
      }
      for (let r = 0; r < 9; r++) {
        for (let d = 1; d <= 9; d++) {
          const hasFixed = this.board.getRow(r).includes(d);
          if (hasFixed) continue;
          let places = [];
          for (let c = 0; c < 9; c++) {
            if (this.board.getValue(r, c) === 0 && this.board.candidates[r][c].has(d)) places.push([r, c]);
          }
          if (places.length === 0) {
            for (let c = 0; c < 9; c++) if (this.board.getValue(r, c) === 0) unitIssueKeys.add(`${r},${c}`);
          }
        }
      }
      for (let c = 0; c < 9; c++) {
        for (let d = 1; d <= 9; d++) {
          let hasFixed = false;
          for (let r = 0; r < 9; r++) {
            if (this.board.getValue(r, c) === d) {
              hasFixed = true;
              break;
            }
          }
          if (hasFixed) continue;
          let places = [];
          for (let r = 0; r < 9; r++) {
            if (this.board.getValue(r, c) === 0 && this.board.candidates[r][c].has(d)) places.push([r, c]);
          }
          if (places.length === 0) {
            for (let r = 0; r < 9; r++) if (this.board.getValue(r, c) === 0) unitIssueKeys.add(`${r},${c}`);
          }
        }
      }
      for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
          for (let d = 1; d <= 9; d++) {
            let hasFixed = false;
            let empties = [];
            for (let r = br * 3; r < br * 3 + 3; r++) {
              for (let c = bc * 3; c < bc * 3 + 3; c++) {
                const v = this.board.getValue(r, c);
                if (v === d) {
                  hasFixed = true;
                }
                if (v === 0) empties.push([r, c]);
              }
            }
            if (hasFixed) continue;
            let hasPlace = false;
            for (const [r, c] of empties) {
              if (this.board.candidates[r][c].has(d)) {
                hasPlace = true;
                break;
              }
            }
            if (!hasPlace && empties.length > 0) {
              for (const [r, c] of empties) unitIssueKeys.add(`${r},${c}`);
            }
          }
        }
      }
      this.cells.forEach((cell) => cell.classList.remove("conflict", "nocands", "unit-issue"));
      conflictKeys.forEach((key) => {
        const [r, c] = key.split(",").map(Number);
        this.getCellElement(r, c).classList.add("conflict");
      });
      noCandKeys.forEach((key) => {
        const [r, c] = key.split(",").map(Number);
        this.getCellElement(r, c).classList.add("nocands");
      });
      unitIssueKeys.forEach((key) => {
        const [r, c] = key.split(",").map(Number);
        this.getCellElement(r, c).classList.add("unit-issue");
      });
      const conflictsChanged = !this.setsEqual(conflictKeys, this.lastConflictKeys);
      const noCandsChanged = !this.setsEqual(noCandKeys, this.lastNoCandKeys);
      const unitIssuesChanged = !this.setsEqual(unitIssueKeys, this.lastUnitIssueKeys || /* @__PURE__ */ new Set());
      if (conflictsChanged || noCandsChanged || unitIssuesChanged) {
        if (conflictKeys.size > 0) this.logMessage(`Conflicts detected in ${conflictKeys.size} cell(s)`, "error");
        if (noCandKeys.size > 0) this.logMessage(`No-candidate issue in ${noCandKeys.size} cell(s)`, "warning");
        if (unitIssueKeys.size > 0) this.logMessage(`Unit impossibility detected (a digit has no place)`, "warning");
        if (conflictKeys.size === 0 && noCandKeys.size === 0 && unitIssueKeys.size === 0) this.logMessage("No conflicts detected", "success");
      }
      this.lastConflictKeys = conflictKeys;
      this.lastNoCandKeys = noCandKeys;
      this.lastUnitIssueKeys = unitIssueKeys;
    }
    setsEqual(a, b) {
      if (a.size !== b.size) return false;
      for (const v of a) if (!b.has(v)) return false;
      return true;
    }
    logMessage(message, type = "info") {
      const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString();
      if (!this.solvingLog) return;
      const entry = document.createElement("div");
      entry.className = `log-entry ${type}`;
      entry.innerHTML = `<strong>[${timestamp}]</strong> ${message}`;
      this.solvingLog.appendChild(entry);
      this.solvingLog.scrollTop = this.solvingLog.scrollHeight;
      const entries = this.solvingLog.querySelectorAll(".log-entry");
      if (entries.length > 50) entries[0].remove();
    }
    getBoardState() {
      return { board: this.board.board, initialBoard: this.board.initialBoard, extensions: this.extensions.exportState(), solvingHistory: this.solvingHistory };
    }
    loadBoardState(state) {
      if (state.board) this.board.loadPuzzle(state.board);
      if (state.extensions) this.extensions.importState(state.extensions);
      if (state.solvingHistory) this.solvingHistory = state.solvingHistory;
      this.updateBoardDisplay();
      this.updateCandidates();
      this.updateExtensionInfo();
    }
    loadFromCodeInput() {
      const input = document.getElementById("codeInput");
      const code = (input?.value || "").trim();
      try {
        this.board.loadFromCode(code);
        this.updateBoardDisplay();
        this.updateCandidates();
        this.clearHighlights();
        this.solvingHistory = [];
        this.logMessage("Loaded puzzle from 81-digit code", "success");
      } catch (e) {
        this.logMessage(e.message || "Invalid code", "error");
      }
    }
  };
  var app_default = SudokuApp;

  // src/entry.ts
  var g = globalThis;
  g.SudokuBoard = sudoku_default;
  g.SudokuTactics = tactics_default2;
  g.SudokuExtensions = extensions_default;
  g.tacticClasses = tactics_default;
  g.SudokuApp = app_default;
  document.addEventListener("DOMContentLoaded", () => {
    try {
      g.sudokuApp = new g.SudokuApp();
    } catch (e) {
      console.warn("entry.ts: failed to auto-instantiate SudokuApp", e);
    }
  });
})();
//# sourceMappingURL=bundle.js.map
