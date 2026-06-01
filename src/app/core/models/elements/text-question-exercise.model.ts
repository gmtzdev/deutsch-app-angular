import { Element } from './element.model';
import { TextQuestionItem } from './text-question-item.model';

export class TextQuestionExercise extends Element {
    questions: TextQuestionItem[];

    constructor(exercise: TextQuestionExercise) {
        super(exercise);
        this.questions = exercise.questions ?? [];
    }
}