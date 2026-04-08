import { Element } from './element.model';
import { QuizQuestion } from './quiz-question.model';

export class Quiz extends Element {
    questions: QuizQuestion[];

    constructor(quiz: Quiz) {
        super(quiz);
        this.questions = quiz.questions ?? [];
    }
}
