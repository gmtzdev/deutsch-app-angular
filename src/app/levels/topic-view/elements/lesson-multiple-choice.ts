import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';
import { MultipleChoiceExercise } from '../../../core/models/elements/multiple-choice-exercise.model';
import { MultipleChoiceQuestion } from '../../../core/models/elements/multiple-choice-question.model';

@Component({
    selector: 'app-lesson-multiple-choice',
    template: `
        <div class="le-mc">
            <form class="le-mc__form" (submit)="check($event)" (reset)="reset()" autocomplete="off">
                @for (q of questions(); track q.id; let qi = $index) {
                <div class="le-mc__question">
                    <p class="le-mc__question-text">{{ qi + 1 }}. {{ q.question }}</p>

                    <div class="le-mc__options" role="radiogroup" [attr.aria-label]="q.question">
                        @for (option of q.options; track $index; let oi = $index) {
                        <label class="le-mc__option"
                               [class.le-mc__option--selected]="selectedOption(q.id) === oi"
                               [class.le-mc__option--correct]="isChecked() && oi === q.correctOption"
                               [class.le-mc__option--wrong]="isChecked() && selectedOption(q.id) === oi && oi !== q.correctOption">
                            <input
                                type="radio"
                                [name]="'mc-' + q.id"
                                [checked]="selectedOption(q.id) === oi"
                                [disabled]="isChecked()"
                                (change)="setSelectedOption(q.id, oi)"
                                [attr.aria-label]="option" />
                            <span>{{ option }}</span>
                        </label>
                        }
                    </div>

                    @if (feedbacks()[q.id] !== null) {
                    <p class="le-mc__feedback" [class.le-mc__feedback--ok]="feedbacks()[q.id] === true"
                        [class.le-mc__feedback--err]="feedbacks()[q.id] === false" aria-live="polite">
                        @if (feedbacks()[q.id] === true) {
                        Correcto
                        } @else {
                        Incorrecto
                        }
                    </p>
                    }
                </div>
                }

                <div class="le-mc__actions">
                    @if (!isChecked()) {
                    <button type="submit" class="le-mc__btn le-mc__btn--check">Corregir</button>
                    }
                    <button type="reset" class="le-mc__btn le-mc__btn--reset">Reiniciar</button>
                </div>
            </form>

            @if (result(); as res) {
            <p class="le-mc__result" aria-live="polite">{{ res }}</p>
            }
        </div>
    `,
    styles: [`
        .le-mc {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
            border-radius: 8px;
            background: var(--color-card, #fff);
            border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .le-mc__form {
            display: flex;
            flex-direction: column;
            gap: 0.9rem;
        }

        .le-mc__question {
            display: flex;
            flex-direction: column;
            gap: 0.45rem;
        }

        .le-mc__question-text {
            margin: 0;
            font-size: 0.92rem;
            font-weight: 600;
            color: var(--color-text, #37352f);
        }

        .le-mc__options {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
        }

        .le-mc__option {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.45rem 0.6rem;
            border: 1px solid rgba(0, 0, 0, 0.12);
            border-radius: 6px;
            background: var(--color-background, #f7f6f3);
        }

        .le-mc__option--selected {
            border-color: rgba(74, 144, 217, 0.55);
        }

        .le-mc__option--correct {
            border-color: #22c55e;
            background: rgba(34, 197, 94, 0.09);
        }

        .le-mc__option--wrong {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.09);
        }

        .le-mc__feedback {
            margin: 0;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .le-mc__feedback--ok {
            color: #15803d;
        }

        .le-mc__feedback--err {
            color: #b91c1c;
        }

        .le-mc__actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.2rem;
        }

        .le-mc__btn {
            padding: 0.5rem 1.25rem;
            border-radius: 6px;
            border: none;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: opacity 0.15s;
        }

        .le-mc__btn:hover {
            opacity: 0.85;
        }

        .le-mc__btn--check {
            background: #1d4ed8;
            color: #fff;
        }

        .le-mc__btn--reset {
            background: rgba(0, 0, 0, 0.07);
            color: var(--color-text, #37352f);
        }

        .le-mc__result {
            font-size: 0.9rem;
            font-weight: 600;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            background: rgba(74, 144, 217, 0.1);
            color: #1d4ed8;
            margin: 0;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonMultipleChoice {
    readonly element = input.required<ElementTypeObj>();

    protected readonly exercise = computed(() => this.element() as MultipleChoiceExercise);
    protected readonly questions = computed<MultipleChoiceQuestion[]>(() => {
        const ex = this.exercise();
        if (Array.isArray(ex.questions) && ex.questions.length > 0) {
            return ex.questions;
        }
        return [];
    });

    protected readonly selections = signal<Record<number, number | null>>({});
    protected readonly feedbacks = signal<Record<number, boolean | null>>({});
    protected readonly result = signal<string | null>(null);
    protected readonly isChecked = signal(false);

    constructor() {
        effect(() => {
            const nextSelections: Record<number, number | null> = {};
            const nextFeedbacks: Record<number, boolean | null> = {};
            for (const q of this.questions()) {
                nextSelections[q.id] = null;
                nextFeedbacks[q.id] = null;
            }
            this.selections.set(nextSelections);
            this.feedbacks.set(nextFeedbacks);
            this.result.set(null);
            this.isChecked.set(false);
        });
    }

    protected selectedOption(questionId: number): number | null {
        return this.selections()[questionId] ?? null;
    }

    protected setSelectedOption(questionId: number, optionIndex: number): void {
        this.selections.update((prev) => ({ ...prev, [questionId]: optionIndex }));
    }

    protected check(event: Event): void {
        event.preventDefault();
        const selections = this.selections();
        const nextFeedbacks: Record<number, boolean | null> = {};
        let correct = 0;

        for (const q of this.questions()) {
            const ok = selections[q.id] === q.correctOption;
            nextFeedbacks[q.id] = ok;
            if (ok) correct++;
        }

        this.feedbacks.set(nextFeedbacks);
        this.isChecked.set(true);
        this.result.set(`Resultado: ${correct} / ${this.questions().length} correctas`);
    }

    protected reset(): void {
        const nextSelections: Record<number, number | null> = {};
        const nextFeedbacks: Record<number, boolean | null> = {};
        for (const q of this.questions()) {
            nextSelections[q.id] = null;
            nextFeedbacks[q.id] = null;
        }
        this.selections.set(nextSelections);
        this.feedbacks.set(nextFeedbacks);
        this.result.set(null);
        this.isChecked.set(false);
    }
}
