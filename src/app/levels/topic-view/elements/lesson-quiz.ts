import { Component, ChangeDetectionStrategy, input, signal, computed } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';
import { Quiz } from '../../../core/models/elements/quiz.model';
import { QuizQuestion } from '../../../core/models/elements/quiz-question.model';

@Component({
    selector: 'app-lesson-quiz',
    template: `
        <div class="le-quiz">
            <form class="le-quiz__form" (submit)="check($event)" (reset)="reset()" autocomplete="off">
                @for (q of questions(); track q.id) {
                <div class="le-quiz__question">
                    <span class="le-quiz__question-text">{{ q.question }}</span>
                    <input
                        class="le-quiz__input"
                        [class.le-quiz__input--correct]="feedbacks()[q.id]?.correct === true"
                        [class.le-quiz__input--wrong]="feedbacks()[q.id]?.correct === false"
                        type="text"
                        placeholder="Deine Antwort…"
                        [value]="answers()[q.id] || ''"
                        (input)="setAnswer(q.id, $any($event.target).value)"
                        [attr.aria-label]="q.question"
                        [readOnly]="submitted()"
                        required
                    />
                    @if (feedbacks()[q.id]; as fb) {
                    <span class="le-quiz__feedback"
                        [class.le-quiz__feedback--correct]="fb.correct"
                        [class.le-quiz__feedback--wrong]="!fb.correct"
                        aria-live="polite">
                        @if (fb.correct) {
                            ✓ Richtig!
                        } @else {
                            ✗ Falsch. {{ fb.hint ? '(' + fb.hint + ')' : '' }}
                        }
                    </span>
                    }
                </div>
                }

                <div class="le-quiz__actions">
                    @if (!submitted()) {
                    <button type="submit" class="le-quiz__btn le-quiz__btn--check">
                        Corregir
                    </button>
                    }
                    <button type="reset" class="le-quiz__btn le-quiz__btn--reset">
                        Reiniciar
                    </button>
                </div>
            </form>

            @if (result(); as res) {
            <p class="le-quiz__result" aria-live="polite">{{ res }}</p>
            }
        </div>
    `,
    styles: [`
        .le-quiz {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
            border-radius: 8px;
            background: var(--color-card, #fff);
            border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .le-quiz__form {
            display: flex;
            flex-direction: column;
            gap: 0.875rem;
        }

        .le-quiz__question {
            display: flex;
            flex-direction: column;
            gap: 0.375rem;
        }

        .le-quiz__question-text {
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--color-text, #37352f);
        }

        .le-quiz__input {
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

            &[readonly] {
                cursor: default;
                opacity: 0.85;
            }
        }

        .le-quiz__feedback {
            font-size: 0.8rem;
            font-weight: 500;

            &--correct { color: #15803d; }
            &--wrong   { color: #b91c1c; }
        }

        .le-quiz__actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.25rem;
        }

        .le-quiz__btn {
            padding: 0.5rem 1.25rem;
            border-radius: 6px;
            border: none;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: opacity 0.15s;

            &:hover { opacity: 0.85; }

            &--check {
                background: #1d4ed8;
                color: #fff;
            }

            &--reset {
                background: rgba(0, 0, 0, 0.07);
                color: var(--color-text, #37352f);
            }
        }

        .le-quiz__result {
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
export class LessonQuiz {
    readonly element = input.required<ElementTypeObj>();

    protected readonly questions = computed(() => (this.element() as Quiz).questions);

    protected readonly answers = signal<Record<number, string>>({});
    protected readonly feedbacks = signal<Record<number, { correct: boolean; hint: string } | null>>({});
    protected readonly result = signal<string | null>(null);
    protected readonly submitted = signal(false);

    protected setAnswer(id: number, value: string): void {
        this.answers.update((prev) => ({ ...prev, [id]: value }));
    }

    protected check(event: Event): void {
        event.preventDefault();
        const qs = this.questions();
        const ans = this.answers();
        const newFeedbacks: Record<number, { correct: boolean; hint: string }> = {};
        let correct = 0;

        for (const q of qs) {
            const userAns = (ans[q.id] ?? '').trim().toLowerCase();
            const isCorrect = userAns === q.answer.trim().toLowerCase();
            if (isCorrect) correct++;
            newFeedbacks[q.id] = { correct: isCorrect, hint: isCorrect ? '' : q.hint };
        }

        this.feedbacks.set(newFeedbacks);
        this.submitted.set(true);
        this.result.set(`Resultado: ${correct} / ${qs.length} correctas`);
    }

    protected reset(): void {
        this.answers.set({});
        this.feedbacks.set({});
        this.result.set(null);
        this.submitted.set(false);
    }
}
