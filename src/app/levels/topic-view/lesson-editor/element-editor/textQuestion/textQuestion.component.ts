import { Component, ChangeDetectionStrategy, signal, input, model } from '@angular/core';
import { TextQuestionItem } from '../../../../../core/models/elements/text-question-item.model';

@Component({
    selector: 'app-editor-lesson-text-question',
    templateUrl: './textQuestion.component.html',
    styleUrls: ['./textQuestion.component.scss', '../lesson-editor.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextQuestionComponent {
    public textQuestions = model<TextQuestionItem[]>([{ id: 1, question: '', answer: '', update: false }]);

    protected setTextQuestionField(index: number, field: 'question' | 'answer', value: string): void {
        this.textQuestions.update((questions) => {
            const next = [...questions];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    }

    protected addTextQuestion(): void {
        // Last id
        const lastId = this.textQuestions().length > 0 ? Math.max(...this.textQuestions().map(q => q.id)) : 0;
        this.textQuestions.update((questions) => [
            ...questions,
            { id: lastId + 1, question: '', answer: '', update: false },
        ]);
    }

    protected removeTextQuestion(index: number): void {
        if (this.textQuestions().length <= 1) return;
        this.textQuestions.update((questions) => questions.filter((_, i) => i !== index));
    }
}