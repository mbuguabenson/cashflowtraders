export type TDigitStat = {
    digit: number;
    count: number;
    percentage: number;
    rank: number;
    power: number;
    is_increasing: boolean;
};

export type TAnalysisHistory = {
    type: 'E' | 'O' | 'U' | 'O_U' | 'M' | 'D' | 'R' | 'F';
    value: string | number;
    color: string;
};

export type TTick = {
    symbol: string;
    quote: number | string;
    epoch: number;
};
