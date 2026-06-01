import { Element } from './element.model';
import { MultipleChoiceQuestion } from './multiple-choice-question.model';

export class MultipleChoiceExercise extends Element {
    questions: MultipleChoiceQuestion[];

    constructor(exercise: MultipleChoiceExercise) {
        super(exercise);
        this.questions = exercise.questions ?? [];
    }
}
