# Sudoku Solver - Human Tactics

A modern, interactive sudoku solving webpage that uses human-like solving tactics instead of brute force algorithms. The solver is designed to be educational and extensible, allowing users to learn various sudoku solving techniques step by step.

## Features

### Core Functionality
- **Interactive Sudoku Grid**: Click and type to enter your own puzzle
- **Step-by-Step Solving**: Apply human-like solving tactics one at a time
- **Multiple Solving Techniques**: From basic to advanced tactics
- **Real-time Validation**: Check puzzle validity as you solve
- **Auto-Solve Mode**: Watch the solver work through tactics automatically
- **Solving Log**: Detailed history of all solving steps

### Solving Tactics Available
1. **Naked Single** (Easy) - A cell with only one possible candidate
2. **Hidden Single** (Easy) - A number that can only go in one cell in a unit
3. **Naked Pair** (Medium) - Two cells with the same two candidates
4. **Hidden Pair** (Medium) - Two numbers that can only go in two cells
5. **Pointing Pair** (Medium) - Candidates in a box restricted to one row/column
6. **Box-Line Reduction** (Medium) - Candidates in a row/column restricted to one box
7. **X-Wing** (Hard) - A pattern across two rows and two columns
8. **Swordfish** (Hard) - Extension of X-Wing with three rows/columns
9. **XY-Wing** (Hard) - A three-cell pattern with shared candidates
10. **XYZ-Wing** (Very Hard) - Extension of XY-Wing with four cells

### Extensible Architecture
- **Custom Rules Support**: Add special constraints to create variant sudokus
- **Thermo Sudoku**: Numbers must increase along thermometer paths
- **Knight's Move**: Numbers cannot repeat in L-shaped knight moves
- **King's Move**: Numbers cannot repeat in adjacent cells (including diagonals)
- **Modular Design**: Easy to add new extensions and tactics

## How to Use

### Basic Usage
1. **Enter a Puzzle**: Click on any cell and type numbers 1-9, or use "Load Example" for a sample puzzle
2. **Select a Tactic**: Choose from the dropdown menu which solving technique to apply
3. **Step Through**: Click "Step" to apply the selected tactic once
4. **Auto Solve**: Click "Auto Solve" to watch the solver work automatically
5. **Reset**: Use "Reset" to return to the original puzzle state

### Using Extensions
1. **Add Thermo Sudoku**: Click "Add Thermo Sudoku" to enable thermometer constraints
2. **Add Knight's Move**: Click "Add Knight's Move" to prevent numbers in L-shaped moves
3. **Add King's Move**: Click "Add King's Move" to prevent numbers in adjacent cells
4. **Clear Extensions**: Remove all custom rules with "Clear Extensions"

### Understanding the Interface
- **Puzzle Grid**: The main 9x9 sudoku grid with 3x3 box borders
- **Tactic Information**: Detailed explanation of the selected solving technique
- **Solving Log**: Real-time updates of all solving actions
- **Extension Info**: Shows active custom rules and their descriptions

## Technical Architecture

### File Structure
```
├── index.html          # Main HTML structure
├── styles.css          # Modern, responsive CSS design
├── sudoku.js           # Core sudoku board logic
├── tactics.js          # Human-like solving tactics
├── extensions.js       # Custom rules and constraints
├── app.js             # Main application controller
└── README.md          # This file
```

### Key Classes

#### SudokuBoard (`sudoku.js`)
- Manages the 9x9 grid state
- Handles candidate tracking and elimination
- Provides validation and completion checking
- Supports basic sudoku rules (row, column, box constraints)

#### SudokuTactics (`tactics.js`)
- Implements various human-like solving techniques
- Provides detailed descriptions and explanations
- Returns structured results with change tracking
- Supports step-by-step execution

#### SudokuExtensions (`extensions.js`)
- Manages custom sudoku variants
- Handles constraint validation
- Provides extensible architecture for new rules
- Supports thermo, knight's move, and king's move constraints

#### SudokuApp (`app.js`)
- Coordinates between all components
- Manages user interface and interactions
- Handles real-time updates and animations
- Provides solving history and logging

### Design Principles

1. **Human-Like Solving**: Focus on techniques that humans actually use
2. **Educational**: Clear explanations and step-by-step progression
3. **Extensible**: Easy to add new tactics and custom rules
4. **Responsive**: Works on desktop and mobile devices
5. **Modern UI**: Clean, intuitive interface with smooth animations

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers supported
- No external dependencies required

## Future Enhancements

### Planned Features
- **More Advanced Tactics**: Remote Pairs, Skyscraper, 2-String Kite
- **Visual Aids**: Candidate highlighting and constraint visualization
- **Puzzle Generation**: Create puzzles with specific difficulty levels
- **Save/Load**: Export and import puzzle states
- **Statistics**: Track solving time and tactic usage
- **Tutorial Mode**: Guided learning of solving techniques

### Custom Extensions
- **Arrow Sudoku**: Numbers along arrows must sum to the circled number
- **Killer Sudoku**: Cage constraints with sum requirements
- **Windoku**: Additional 3x3 regions with different constraints
- **Diagonal Sudoku**: Main diagonal constraints
- **Irregular Sudoku**: Non-standard 3x3 regions

## Contributing

The codebase is designed to be easily extensible. To add new features:

1. **New Tactics**: Add methods to `SudokuTactics` class
2. **New Extensions**: Extend `SudokuExtensions` class
3. **UI Improvements**: Modify `SudokuApp` and CSS
4. **Bug Fixes**: Submit issues and pull requests

## License

This project is open source and available under the MIT License.

## Getting Started

1. Clone or download the repository
2. Open `index.html` in a web browser
3. Start solving sudoku puzzles with human-like tactics!

No build process or dependencies required - it's a pure HTML/CSS/JavaScript application.
