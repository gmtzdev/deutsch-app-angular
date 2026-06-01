import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { MultipleChoiceQuestion } from '../../../../../core/models/elements/multiple-choice-question.model';

@Component({
    selector: 'app-editor-lesson-multiple-choice',
    templateUrl: './multipleChoice.component.html',
    styleUrls: ['./multipleChoice.component.scss', '../lesson-editor.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultipleChoiceComponent {
    public multipleChoiceQuestions = model<MultipleChoiceQuestion[]>([
        { id: 1, question: '', options: ['', ''], correctOption: 0, update: false },
    ]);

    protected setQuestionField(index: number, value: string): void {
        this.multipleChoiceQuestions.update((questions) => {
            const next = [...questions];
            next[index] = { ...next[index], question: value };
            return next;
        });
    }

    protected setOption(questionIndex: number, optionIndex: number, value: string): void {
        this.multipleChoiceQuestions.update((questions) => {
            const next = [...questions];
            const q = next[questionIndex];
            const options = [...q.options];
            options[optionIndex] = value;
            next[questionIndex] = { ...q, options };
            return next;
        });
    }

    protected addOption(questionIndex: number): void {
        this.multipleChoiceQuestions.update((questions) => {
            const next = [...questions];
            const q = next[questionIndex];
            if (q.options.length >= 6) return next;
            next[questionIndex] = { ...q, options: [...q.options, ''] };
            return next;
        });
    }

    protected removeOption(questionIndex: number, optionIndex: number): void {
        this.multipleChoiceQuestions.update((questions) => {
            const next = [...questions];
            const q = next[questionIndex];
            if (q.options.length <= 2) return next;

            const options = q.options.filter((_, i) => i !== optionIndex);
            let correctOption = q.correctOption;
            if (correctOption === optionIndex) {
                correctOption = 0;
            } else if (correctOption > optionIndex) {
                correctOption -= 1;
            }

            next[questionIndex] = { ...q, options, correctOption };
            return next;
        });
    }

    protected setCorrectOption(questionIndex: number, optionIndex: number): void {
        this.multipleChoiceQuestions.update((questions) => {
            const next = [...questions];
            const q = next[questionIndex];
            next[questionIndex] = { ...q, correctOption: optionIndex };
            return next;
        });
    }

    protected addQuestion(): void {
        const lastId = this.multipleChoiceQuestions().length > 0
            ? Math.max(...this.multipleChoiceQuestions().map((q) => q.id))
            : 0;

        this.multipleChoiceQuestions.update((questions) => [
            ...questions,
            { id: lastId + 1, question: '', options: ['', ''], correctOption: 0, update: false },
        ]);
    }

    protected removeQuestion(index: number): void {
        if (this.multipleChoiceQuestions().length <= 1) return;
        this.multipleChoiceQuestions.update((questions) => questions.filter((_, i) => i !== index));
    }
}
