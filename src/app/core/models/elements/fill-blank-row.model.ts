export interface FillBlankRow {
    id: number;
    /** Full sentence with ___ marking each blank. E.g. "Der Mann ___ nach Hause ___." */
    sentence: string;
    /** Correct answers for each blank in order. */
    answers: string[];
}
