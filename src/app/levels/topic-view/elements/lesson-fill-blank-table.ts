import { Component, ChangeDetectionStrategy, input, computed, signal, effect } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';
import { FillBlankTableExercise } from '../../../core/models/elements/fill-blank-table-exercise.model';

function parseSentence(sentence: string): string[] {
    return sentence.split('___');
}

@Component({
    selector: 'app-lesson-fill-blank-table',
    template: `
        <div class="le-fbt">
            <div class="le-fbt__table-wrap">
                <table class="le-fbt__table" aria-label="Ejercicio de completar espacios en tabla">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Oracion</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (row of exercise().rows; track row.id; let ri = $index) {
                        <tr class="le-fbt__row"
                            [class.le-fbt__row--correct]="rowFeedbacks()[ri] === 'correct'"
                            [class.le-fbt__row--wrong]="rowFeedbacks()[ri] === 'wrong'">
                            <td class="le-fbt__index">{{ ri + 1 }}</td>
                            <td class="le-fbt__sentence-cell">
                                @for (part of parseSentence(row.sentence); track $index; let pi = $index) {
                                <span class="le-fbt__text">{{ part }}</span>
                                @if (pi < parseSentence(row.sentence).length - 1) {
                                <span class="le-fbt__blank-wrap">
                                    <input
                                        class="le-fbt__input"
                                        type="text"
                                        [value]="getUserValue(ri, pi)"
                                        [attr.aria-label]="'Espacio ' + (pi + 1) + ', fila ' + (ri + 1)"
                                        [attr.size]="getInputSize(row.answers[pi])"
                                        autocomplete="off"
                                        autocorrect="off"
                                        spellcheck="false"
                                        (input)="onInput(ri, pi, $any($event.target).value)" />
                                    @if (rowFeedbacks()[ri] === 'wrong' && row.answers[pi]) {
                                    <span class="le-fbt__hint">{{ row.answers[pi] }}</span>
                                    }
                                </span>
                                }
                                }
                            </td>
                            <td class="le-fbt__status" aria-live="polite">
                                @if (rowFeedbacks()[ri] === 'correct') { ✅ }
                                @else if (rowFeedbacks()[ri] === 'wrong') { ❌ }
                                @else { - }
                            </td>
                        </tr>
                        }
                    </tbody>
                </table>
            </div>

            <div class="le-fbt__actions">
                <button type="button" class="le-fbt__btn le-fbt__btn--check" (click)="check()">Corregir</button>
                <button type="button" class="le-fbt__btn le-fbt__btn--reset" (click)="reset()">Reiniciar</button>
            </div>

            @if (result(); as res) {
            <p class="le-fbt__result" aria-live="polite">{{ res }}</p>
            }
        </div>
    `,
    styles: [`
        .le-fbt {
            display: flex;
            flex-direction: column;
            gap: 0.9rem;
            padding: 1rem;
            border-radius: 8px;
            background: var(--color-card, #fff);
            border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .le-fbt__table-wrap {
            overflow-x: auto;
        }

        .le-fbt__table {
            width: 100%;
            border-collapse: collapse;
            min-width: 540px;

            th,
            td {
                border: 1px solid rgba(0, 0, 0, 0.12);
                padding: 0.55rem 0.6rem;
                vertical-align: top;
            }

            th {
                text-align: left;
                font-size: 0.78rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--color-indications, #9b9a97);
                background: var(--color-background, #f7f6f3);
            }
        }

        .le-fbt__row--correct {
            background: rgba(34, 197, 94, 0.06);
        }

        .le-fbt__row--wrong {
            background: rgba(239, 68, 68, 0.06);
        }

        .le-fbt__index {
            width: 48px;
            text-align: center;
            font-weight: 700;
        }

        .le-fbt__sentence-cell {
            line-height: 1.8;
        }

        .le-fbt__text {
            font-size: 0.92rem;
            color: var(--color-text, #37352f);
            white-space: pre-wrap;
        }

        .le-fbt__blank-wrap {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            margin: 0 0.2rem;
            gap: 0.1rem;
        }

        .le-fbt__input {
            min-width: 64px;
            padding: 0.15rem 0.35rem;
            border: none;
            border-bottom: 2px solid rgba(0, 0, 0, 0.25);
            background: transparent;
            font-size: 0.92rem;
            font-family: inherit;
            text-align: center;
            outline: none;

            &:focus {
                border-bottom-color: #1d4ed8;
            }
        }

        .le-fbt__hint {
            font-size: 0.7rem;
            color: #b91c1c;
            font-weight: 600;
            white-space: nowrap;
        }

        .le-fbt__status {
            width: 70px;
            text-align: center;
            font-size: 0.95rem;
            font-weight: 700;
        }

        .le-fbt__actions {
            display: flex;
            gap: 0.5rem;
        }

        .le-fbt__btn {
            padding: 0.45rem 1.1rem;
            border-radius: 6px;
            border: none;
            font-size: 0.86rem;
            font-weight: 600;
            cursor: pointer;

            &--check {
                background: #1d4ed8;
                color: #fff;
            }

            &--reset {
                background: rgba(0, 0, 0, 0.07);
                color: var(--color-text, #37352f);
            }
        }

        .le-fbt__result {
            margin: 0;
            font-size: 0.9rem;
            font-weight: 600;
            color: #1d4ed8;
            background: rgba(74, 144, 217, 0.1);
            border-radius: 6px;
            padding: 0.45rem 0.65rem;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonFillBlankTable {
    readonly element = input.required<ElementTypeObj>();

    protected readonly exercise = computed(() => this.element() as FillBlankTableExercise);
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
        this.result.set(`${correct} / ${feedbacks.length} filas correctas`);
    }

    protected reset(): void {
        const ex = this.exercise();
        this.userValues.set(ex.rows.map(row => row.answers.map(() => '')));
        this.rowFeedbacks.set(ex.rows.map(() => null));
        this.result.set(null);
    }
}
