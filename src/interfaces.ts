import { TacticResult, TacticChange } from './tactics/types';

export interface BoardAPI {
    board: number[][];
    initialBoard: number[][];
    candidates: Set<number>[][];
    bannedCandidates: Set<number>[][];
    solvingHistory: Array<{ tactic: string; result: TacticResult; timestamp: Date }>;

    loadPuzzle(puzzle: number[][]): void;
    resetCandidates(): void;
    clearAllBans(): void;
    updateCandidates(): void;
    removeCandidateFromPeers(row: number, col: number, value: number): void;
    banCandidate(row: number, col: number, value: number): void;
    setValue(row: number, col: number, value: number): boolean;
    getValue(row: number, col: number): number;
    getCandidates(row: number, col: number): number[];
    isBoardValid(): boolean;
    isComplete(): boolean;
    getRow(row: number): number[];
    getColumn(col: number): number[];
    loadFromCode?(code: string): void;
    loadFromString?(str: string): void;
    reset?(): void;
}

export interface TacticsAPI {
    setExtensions(ext: ExtensionsAPI | null): void;
    executeTactic(name: string): TacticResult;
    getTacticDescription(name: string): { name: string; description: string; difficulty: string; explanation: string };
}

export interface ExtensionsAPI {
    getActiveExtensions?(): any[];
    validateMove?(row: number, col: number, value: number): boolean;
    updateCandidatesWithExtensions?(): void;
    exportState?(): any;
    importState?(state: any): void;
    getExampleThermoPaths?(): any;
    addThermoSudoku?(paths: any): { success: boolean; message: string };
    addKnightsMove?(): { success: boolean; message: string };
    addKingsMove?(): { success: boolean; message: string };
    addBoxSumNeighbor?(): { success: boolean; message: string };
    clearExtensions?(): { success: boolean; message: string };
    getExtensionDescription?(ext: any): { name: string; description: string; difficulty?: string };
    getConstraintCount?(ext: any): number;
    exportState?(): any;
    importState?(s: any): void;
}

export type { TacticResult, TacticChange };
