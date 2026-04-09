import { Component, ChangeDetectionStrategy, input, computed, signal, effect } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';
import { DragDropExercise } from '../../../core/models/elements/drag-drop-exercise.model';

@Component({
    selector: 'app-lesson-drag-drop',
    template: `
        <div class="le-dnd">
            <div class="le-dnd__word-bank"
                 [class.le-dnd__word-bank--over]="dragOverBank()"
                 (dragover)="onBankDragOver($event)"
                 (dragleave)="dragOverBank.set(false)"
                 (drop)="onBankDrop($event)"
                 aria-label="Banco de palabras">
                @for (word of wordBank(); track word + $index) {
                <button type="button" class="le-dnd__word"
                        draggable="true"
                        [class.le-dnd__word--dragging]="dragging()?.word === word && dragging()?.from === 'bank'"
                        (dragstart)="onWordDragStart(word, 'bank')"
                        (dragend)="dragging.set(null)">
                    {{ word }}
                </button>
                }
                @if (wordBank().length === 0) {
                <span class="le-dnd__bank-empty">Banco vacío</span>
                }
            </div>

            <div class="le-dnd__quiz">
                @for (row of rows(); track row.id; let ri = $index) {
                <div class="le-dnd__row"
                     [class.le-dnd__row--correct]="feedbacks()[ri] === 'correct'"
                     [class.le-dnd__row--wrong]="feedbacks()[ri] === 'wrong'">
                    @if (row.before) {
                    <span class="le-dnd__sentence">{{ row.before }}</span>
                    }
                    <div class="le-dnd__dropzone"
                         [class.le-dnd__dropzone--over]="dragOverZone() === ri"
                         [class.le-dnd__dropzone--filled]="dropValues()[ri] !== null"
                         (dragover)="onZoneDragOver($event, ri)"
                         (dragleave)="onZoneDragLeave(ri)"
                         (drop)="onZoneDrop($event, ri)"
                         [attr.aria-label]="'Espacio ' + (ri + 1)">
                        @if (dropValues()[ri]; as word) {
                        <button type="button" class="le-dnd__word le-dnd__word--placed"
                                draggable="true"
                                [class.le-dnd__word--dragging]="dragging()?.from === ri"
                                (dragstart)="onWordDragStart(word, ri)"
                                (dragend)="dragging.set(null)">
                            {{ word }}
                        </button>
                        } @else {
                        <span class="le-dnd__drop-hint" aria-hidden="true">Suelta aquí</span>
                        }
                    </div>
                    @if (row.after) {
                    <span class="le-dnd__sentence">{{ row.after }}</span>
                    }
                    <span class="le-dnd__feedback" aria-live="polite">
                        @if (feedbacks()[ri] === 'correct') { ✅ Correcto }
                        @else if (feedbacks()[ri] === 'wrong') { ❌ Correcta: {{ row.answer }} }
                    </span>
                </div>
                }
            </div>

            <div class="le-dnd__actions">
                <button type="button" class="le-dnd__btn le-dnd__btn--check" (click)="check()">
                    Corregir
                </button>
                <button type="button" class="le-dnd__btn le-dnd__btn--reset" (click)="reset()">
                    Reiniciar
                </button>
            </div>

            @if (result(); as res) {
            <p class="le-dnd__result" aria-live="polite">{{ res }}</p>
            }
        </div>
    `,
    styles: [`
        .le-dnd {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
            border-radius: 8px;
            background: var(--color-card, #fff);
            border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .le-dnd__word-bank {
            display: flex;
            flex-wrap: wrap;
            gap: 0.6rem;
            padding: 0.75rem;
            border: 2px dashed rgba(0, 0, 0, 0.15);
            border-radius: 10px;
            min-height: 52px;
            transition: border-color 0.15s, background 0.15s;

            &--over {
                border-color: #4a90d9;
                background: rgba(74, 144, 217, 0.05);
            }
        }

        .le-dnd__bank-empty {
            font-size: 0.8rem;
            color: var(--color-indications, #9b9a97);
            align-self: center;
        }

        .le-dnd__word {
            padding: 0.4rem 0.75rem;
            border: 1.5px solid rgba(0, 0, 0, 0.15);
            background: var(--color-background, #f7f6f3);
            border-radius: 8px;
            cursor: grab;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--color-text, #37352f);
            transition: opacity 0.15s, border-color 0.15s;

            &:hover { border-color: #4a90d9; }
            &--dragging { opacity: 0.4; cursor: grabbing; }
            &--placed {
                background: var(--color-card, #fff);
                border-color: #4a90d9;
            }
        }

        .le-dnd__quiz {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .le-dnd__row {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 0.6rem;
            padding: 0.75rem;
            border: 1.5px solid rgba(0, 0, 0, 0.1);
            border-radius: 10px;
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

        .le-dnd__sentence {
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--color-text, #37352f);
        }

        .le-dnd__dropzone {
            min-width: 120px;
            min-height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px dashed rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            padding: 0.25rem 0.5rem;
            background: var(--color-background, #f7f6f3);
            transition: border-color 0.15s, background 0.15s;

            &--over {
                border-color: #4a90d9;
                background: rgba(74, 144, 217, 0.08);
            }
            &--filled {
                border-style: solid;
                border-color: rgba(0, 0, 0, 0.15);
                background: transparent;
            }
        }

        .le-dnd__drop-hint {
            font-size: 0.8rem;
            color: var(--color-indications, #9b9a97);
            user-select: none;
        }

        .le-dnd__feedback {
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--color-text, #37352f);
        }

        .le-dnd__actions {
            display: flex;
            gap: 0.5rem;
        }

        .le-dnd__btn {
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

        .le-dnd__result {
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
export class LessonDragDrop {
    readonly element = input.required<ElementTypeObj>();

    protected readonly exercise = computed(() => this.element() as DragDropExercise);
    protected readonly rows = computed(() => this.exercise().rows);

    protected readonly wordBank = signal<string[]>([]);
    protected readonly dropValues = signal<(string | null)[]>([]);
    protected readonly feedbacks = signal<('correct' | 'wrong' | null)[]>([]);
    protected readonly result = signal<string | null>(null);
    protected readonly submitted = signal(false);
    protected readonly dragging = signal<{ word: string; from: 'bank' | number } | null>(null);
    protected readonly dragOverBank = signal(false);
    protected readonly dragOverZone = signal<number | null>(null);

    constructor() {
        effect(() => {
            const ex = this.exercise();
            this.wordBank.set([...ex.words]);
            this.dropValues.set(ex.rows.map(() => null));
            this.feedbacks.set(ex.rows.map(() => null));
            this.result.set(null);
            this.submitted.set(false);
        });
    }

    protected onWordDragStart(word: string, from: 'bank' | number): void {
        this.dragging.set({ word, from });
    }

    protected onBankDragOver(event: DragEvent): void {
        event.preventDefault();
        this.dragOverBank.set(true);
    }

    protected onBankDrop(event: DragEvent): void {
        event.preventDefault();
        this.dragOverBank.set(false);
        const d = this.dragging();
        if (!d || d.from === 'bank') return;

        const fromZone = d.from as number;
        this.dropValues.update(vals => {
            const next = [...vals];
            next[fromZone] = null;
            return next;
        });
        this.wordBank.update(bank => [...bank, d.word]);
        this.clearStatus();
    }

    protected onZoneDragOver(event: DragEvent, zoneIndex: number): void {
        event.preventDefault();
        this.dragOverZone.set(zoneIndex);
    }

    protected onZoneDragLeave(zoneIndex: number): void {
        if (this.dragOverZone() === zoneIndex) this.dragOverZone.set(null);
    }

    protected onZoneDrop(event: DragEvent, zoneIndex: number): void {
        event.preventDefault();
        this.dragOverZone.set(null);
        const d = this.dragging();
        if (!d) return;

        // Dropped on the same source zone — no-op
        if (d.from === zoneIndex) return;

        const currentInZone = this.dropValues()[zoneIndex];

        if (d.from === 'bank') {
            if (currentInZone !== null) {
                this.wordBank.update(bank => [...bank, currentInZone]);
            }
            this.wordBank.update(bank => {
                const idx = bank.indexOf(d.word);
                if (idx === -1) return bank;
                const next = [...bank];
                next.splice(idx, 1);
                return next;
            });
        } else {
            const fromZone = d.from as number;
            if (currentInZone !== null) {
                this.wordBank.update(bank => [...bank, currentInZone]);
            }
            this.dropValues.update(vals => {
                const next = [...vals];
                next[fromZone] = null;
                return next;
            });
        }

        this.dropValues.update(vals => {
            const next = [...vals];
            next[zoneIndex] = d.word;
            return next;
        });
        this.clearStatus();
    }

    private clearStatus(): void {
        this.feedbacks.update(fs => fs.map(() => null));
        this.result.set(null);
        this.submitted.set(false);
    }

    protected check(): void {
        const rs = this.rows();
        const vals = this.dropValues();
        let score = 0;
        const newFeedbacks: ('correct' | 'wrong' | null)[] = rs.map((row, i) => {
            const v = vals[i];
            if (v === null) return 'wrong';
            const isCorrect = v.trim().toLowerCase() === row.answer.trim().toLowerCase();
            if (isCorrect) score++;
            return isCorrect ? 'correct' : 'wrong';
        });
        this.feedbacks.set(newFeedbacks);
        this.submitted.set(true);
        this.result.set(`Resultado: ${score} / ${rs.length} correctas`);
    }

    protected reset(): void {
        const ex = this.exercise();
        this.wordBank.set([...ex.words]);
        this.dropValues.set(ex.rows.map(() => null));
        this.clearStatus();
    }
}
