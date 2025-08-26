export interface TacticChange {
    row?: number;
    col?: number;
    value?: number;
    removed?: number[];
    type?: string;
    [key: string]: any;
}

export interface TacticResult {
    found: boolean;
    message: string;
    changes?: TacticChange[];
}

export default TacticResult;
