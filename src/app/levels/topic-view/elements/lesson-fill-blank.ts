import { Component, ChangeDetectionStrategy, input, computed, signal, effect } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';
import { FillBlankExercise } from '../../../core/models/elements/fill-blank-exercise.model';

/** Splits a sentence by the ___ placeholder into segments. */
function parseSentence(sentence: string): string[] {
    return sentence.split('___');
}

@Component({
    selector: 'app-lesson-fill-blank',
    template: `
        <div class="le-fb">
            <div class="le-fb__rows">
                @for (row of exercise().rows; track row.id; let ri = $index) {
                <div class="le-fb__row"
                     [class.le-fb__row--correct]="rowFeedbacks()[ri] === 'correct'"
                     [class.le-fb__row--wrong]="rowFeedbacks()[ri] === 'wrong'">

                    @for (part of parseSentence(row.sentence); track $index; let pi = $index) {
                    <span class="le-fb__text">{{ part }}</span>
                    @if (pi < parseSentence(row.sentence).length - 1) {
                    <span class="le-fb__blank-wrapper">
                        <input
                            class="le-fb__input"
                            type="text"
                            [class.le-fb__input--correct]="rowFeedbacks()[ri] === 'correct'"
                            [class.le-fb__input--wrong]="rowFeedbacks()[ri] === 'wrong'"
                            [attr.aria-label]="'Espacio ' + (pi + 1) + ' de la oración ' + (ri + 1)"
                            [value]="getUserValue(ri, pi)"
                            [attr.size]="getInputSize(row.answers[pi])"
                            autocomplete="off"
                            autocorrect="off"
                            spellcheck="false"
                            (input)="onInput(ri, pi, $any($event.target).value)" />
                        @if (rowFeedbacks()[ri] === 'wrong' && row.answers[pi]) {
                        <span class="le-fb__hint" aria-live="polite">{{ row.answers[pi] }}</span>
                        }
                    </span>
                    }
                    }

                    <span class="le-fb__row-feedback" aria-live="polite">
                        @if (rowFeedbacks()[ri] === 'correct') { ✅ }
                        @else if (rowFeedbacks()[ri] === 'wrong') { ❌ }
                    </span>
                </div>
                }
            </div>

            <div class="le-fb__actions">
                <button type="button" class="le-fb__btn le-fb__btn--check" (click)="check()">
                    Corregir
                </button>
                <button type="button" class="le-fb__btn le-fb__btn--reset" (click)="reset()">
                    Reiniciar
                </button>
            </div>

            @if (result(); as res) {
            <p class="le-fb__result" aria-live="polite">{{ res }}</p>
            }
        </div>
    `,
    styles: [`
        .le-fb {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
            border-radius: 8px;
            background: var(--color-card, #fff);
            border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .le-fb__rows {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .le-fb__row {
            display: flex;
            flex-wrap: wrap;
            align-items: baseline;
            gap: 0.25rem 0.2rem;
            padding: 0.75rem 1rem;
            border: 1.5px solid rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            line-height: 1.8;
            transition: border-color 0.15s, background 0.15s;

            &--correct {
                border-color: #22c55e;
                background: rgba(34, 197, 94, 0.06);
            }
            &--wrong {
                border-color: #ef4444;
                background: rgba(239, 68, 68, 0.06);
            }
        }

        .le-fb__text {
            font-size: 0.95rem;
            color: var(--color-text, #37352f);
            white-space: pre-wrap;
        }

        .le-fb__blank-wrapper {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            gap: 0.1rem;
            margin: 0 0.15rem;
        }

        .le-fb__input {
            min-width: 60px;
            padding: 0.2rem 0.4rem;
            border: none;
            border-bottom: 2px solid rgba(0, 0, 0, 0.25);
            background: transparent;
            font-size: 0.95rem;
            font-family: inherit;
            font-weight: 600;
            color: var(--color-text, #37352f);
            text-align: center;
            border-radius: 0;
            transition: border-color 0.15s;
            outline: none;

            &:focus {
                border-bottom-color: #1d4ed8;
            }
            &--correct {
                border-bottom-color: #22c55e;
                color: #15803d;
            }
            &--wrong {
                border-bottom-color: #ef4444;
                color: #b91c1c;
            }
        }

        .le-fb__hint {
            font-size: 0.72rem;
            font-weight: 600;
            color: #b91c1c;
            white-space: nowrap;
        }

        .le-fb__row-feedback {
            font-size: 1rem;
            margin-left: 0.25rem;
            align-self: center;
        }

        .le-fb__actions {
            display: flex;
            gap: 0.5rem;
        }

        .le-fb__btn {
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

        .le-fb__result {
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
export class LessonFillBlank {
    readonly element = input.required<ElementTypeObj>();

    protected readonly exercise = computed(() => this.element() as FillBlankExercise);

    /** userValues[rowIndex][blankIndex] */
    protected readonly userValues = signal<string[][]>([]);
    protected readonly rowFeedbacks = signal<('correct' | 'wrong' | null)[]>([]);
    protected readonly result = signal<string | null>(null);

    protected readonly parseSentence = parseSentence;

    constructor() {
        effect(() => {
            const ex = this.exercise();
            this.userValues.set(ex.rows.map(row => row.answers.map(() => '')));
            this.rowFeedbacks.set(ex.rows.map(() => null));
            this.result.set(null);
        });
    }

    protected getUserValue(rowIdx: number, blankIdx: number): string {
        return this.userValues()[rowIdx]?.[blankIdx] ?? '';
    }

    protected getInputSize(answer: string): number {
        return Math.max(6, (answer?.length ?? 0) + 4);
    }

    protected onInput(rowIdx: number, blankIdx: number, value: string): void {
        this.userValues.update(vals => {
            const next = vals.map(r => [...r]);
            if (!next[rowIdx]) return next;
            next[rowIdx][blankIdx] = value;
            return next;
        });
        // Clear feedback for this row when user edits it
        this.rowFeedbacks.update(fbs => {
            const next = [...fbs];
            next[rowIdx] = null;
            return next;
        });
        this.result.set(null);
    }

    protected check(): void {
        const ex = this.exercise();
        const feedbacks = ex.rows.map((row, ri) =>
            row.answers.every((ans, bi) =>
                (this.userValues()[ri]?.[bi] ?? '').trim().toLowerCase() === ans.trim().toLowerCase()
            ) ? 'correct' as const : 'wrong' as const
        );
        this.rowFeedbacks.set(feedbacks);
        const correct = feedbacks.filter(f => f === 'correct').length;
        this.result.set(`${correct} / ${feedbacks.length} oraciones correctas`);
    }

    protected reset(): void {
        const ex = this.exercise();
        this.userValues.set(ex.rows.map(row => row.answers.map(() => '')));
        this.rowFeedbacks.set(ex.rows.map(() => null));
        this.result.set(null);
    }
}
