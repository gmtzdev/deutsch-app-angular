export interface MultipleChoiceQuestion {
    id: number;
    question: string;
    options: string[];
    correctOption: number;
    update: boolean;
}
