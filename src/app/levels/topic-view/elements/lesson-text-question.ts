import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';
import { TextQuestionExercise } from '../../../core/models/elements/text-question-exercise.model';
import { TextQuestionItem } from '../../../core/models/elements/text-question-item.model';

@Component({
    selector: 'app-lesson-text-question',
    template: `
        <div class="le-tq">
            <form class="le-tq__form" (submit)="check($event)" (reset)="reset()" autocomplete="off">
                @for (q of questions(); track q.id; let qi = $index) {
                <div class="le-tq__question">
                    <span class="le-tq__label">{{ qi + 1 }}. {{ q.question }}</span>
                    <input
                        class="le-tq__input"
                        [class.le-tq__input--correct]="feedbacks()[q.id] === true"
                        [class.le-tq__input--wrong]="feedbacks()[q.id] === false"
                        type="text"
                        placeholder="Escribe tu respuesta..."
                        [value]="answers()[q.id] || ''"
                        (input)="setAnswer(q.id, $any($event.target).value)"
                        [attr.aria-label]="q.question"
                        [readOnly]="submitted()"
                        required
                    />
                    @if (feedbacks()[q.id] === false) {
                    <span class="le-tq__feedback le-tq__feedback--wrong" aria-live="polite">
                        Respuesta esperada: {{ q.answer }}
                    </span>
                    }
                    @if (feedbacks()[q.id] === true) {
                    <span class="le-tq__feedback le-tq__feedback--correct" aria-live="polite">
                        Correcto
                    </span>
                    }
                </div>
                }

                <div class="le-tq__actions">
                    @if (!submitted()) {
                    <button type="submit" class="le-tq__btn le-tq__btn--check">Corregir</button>
                    }
                    <button type="reset" class="le-tq__btn le-tq__btn--reset">Reiniciar</button>
                </div>
            </form>

            @if (result(); as res) {
            <p class="le-tq__result" aria-live="polite">{{ res }}</p>
            }
        </div>
    `,
    styles: [`
        .le-tq {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
            border-radius: 8px;
            background: var(--color-card, #fff);
            border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .le-tq__form {
            display: flex;
            flex-direction: column;
            gap: 0.9rem;
        }

        .le-tq__question {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
        }

        .le-tq__label {
            font-size: 0.92rem;
            font-weight: 600;
            color: var(--color-text, #37352f);
        }

        .le-tq__input {
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            border: 1.5px solid rgba(0, 0, 0, 0.15);
            font-size: 0.875rem;
            color: var(--color-text, #37352f);
            background: var(--color-background, #f7f6f3);
            width: 100%;
            box-sizing: border-box;
            transition: border-color 0.15s;
            outline: none;

            &:focus {
                border-color: rgba(74, 144, 217, 0.6);
            }

            &--correct {
                border-color: #22c55e;
                background: rgba(34, 197, 94, 0.07);
            }

            &--wrong {
                border-color: #ef4444;
                background: rgba(239, 68, 68, 0.07);
            }
        }

        .le-tq__feedback {
            font-size: 0.8rem;
            font-weight: 600;
        }

        .le-tq__feedback--correct {
            color: #15803d;
        }

        .le-tq__feedback--wrong {
            color: #b91c1c;
        }

        .le-tq__actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.25rem;
        }

        .le-tq__btn {
            padding: 0.5rem 1.25rem;
            border-radius: 6px;
            border: none;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: opacity 0.15s;

            &:hover {
                opacity: 0.85;
            }
        }

        .le-tq__btn--check {
            background: #1d4ed8;
            color: #fff;
        }

        .le-tq__btn--reset {
            background: rgba(0, 0, 0, 0.07);
            color: var(--color-text, #37352f);
        }

        .le-tq__result {
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
export class LessonTextQuestion {
    readonly element = input.required<ElementTypeObj>();

    protected readonly exercise = computed(() => this.element() as TextQuestionExercise);
    protected readonly questions = computed<TextQuestionItem[]>(() => {
        const ex = this.exercise();
        if (Array.isArray(ex.questions) && ex.questions.length > 0) {
            return ex.questions;
        }
        return [];
    });

    protected readonly answers = signal<Record<number, string>>({});
    protected readonly feedbacks = signal<Record<number, boolean | null>>({});
    protected readonly result = signal<string | null>(null);
    protected readonly submitted = signal(false);

    constructor() {
        effect(() => {
            const emptyFeedbacks = this.questions().reduce<Record<number, boolean | null>>((acc, q) => {
                acc[q.id] = null;
                return acc;
            }, {});
            this.feedbacks.set(emptyFeedbacks);
            this.answers.set({});
            this.result.set(null);
            this.submitted.set(false);
        });
    }

    protected setAnswer(id: number, value: string): void {
        this.answers.update((prev) => ({ ...prev, [id]: value }));
    }

    protected check(event: Event): void {
        event.preventDefault();
        const qs = this.questions();
        const ans = this.answers();
        const nextFeedbacks: Record<number, boolean | null> = {};
        let correct = 0;

        for (const q of qs) {
            const ok = (ans[q.id] ?? '').trim().toLowerCase() === q.answer.trim().toLowerCase();
            nextFeedbacks[q.id] = ok;
            if (ok) correct++;
        }

        this.feedbacks.set(nextFeedbacks);
        this.submitted.set(true);
        this.result.set(`Resultado: ${correct} / ${qs.length} correctas`);
    }

    protected reset(): void {
        this.answers.set({});
        this.feedbacks.set(this.questions().reduce<Record<number, boolean | null>>((acc, q) => {
            acc[q.id] = null;
            return acc;
        }, {}));
        this.result.set(null);
        this.submitted.set(false);
    }
}