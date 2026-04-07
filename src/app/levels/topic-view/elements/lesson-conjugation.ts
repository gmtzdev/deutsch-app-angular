import { Component, ChangeDetectionStrategy, input, computed, signal } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';
import { Conjugation } from '../../../core/models/elements/conjugation.model';
import { VerbData } from '../../../core/models/elements/verb-data.model';

@Component({
    selector: 'app-lesson-conjugation',
    template: `
        <div class="le-conj">
            @if (verbs().length > 1) {
            <div class="le-conj__verb-buttons" role="group" aria-label="Verbos">
                @for (verb of verbs(); track verb.name; let idx = $index) {
                <button type="button" class="le-conj__verb-btn"
                    [class.le-conj__verb-btn--active]="activeIndex() === idx"
                    (click)="activeIndex.set(idx)">
                    {{ verb.name }}
                </button>
                }
            </div>
            }

            @if (activeVerb(); as verb) {
            <div class="le-conj__table-wrapper" role="region" [attr.aria-label]="'Conjugación de ' + verb.name">
                <table class="le-conj__table vocab-table">
                    <thead>
                        <tr>
                            <th scope="col">Pronomen</th>
                            <th scope="col">Verb</th>
                            <th scope="col">Endung</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (row of verb.rows; track $index) {
                        <tr>
                            <td class="le-conj__pronoun">{{ row.pronoun }}</td>
                            <td>{{ row.verb }}</td>
                            <td class="le-conj__ending">{{ row.ending }}</td>
                        </tr>
                        }
                    </tbody>
                </table>
            </div>
            }
        </div>
    `,
    styles: [`
        .le-conj {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin: 0.5rem 0;
        }

        .le-conj__verb-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }

        .le-conj__verb-btn {
            padding: 4px 14px;
            border-radius: 999px;
            border: 1px solid rgba(0, 0, 0, 0.12);
            background: var(--color-background, #f7f6f3);
            font-size: 0.82rem;
            font-weight: 500;
            cursor: pointer;
            color: var(--color-text, #37352f);
            transition: background 0.12s, border-color 0.12s, color 0.12s;

            &--active {
                background: rgba(74, 144, 217, 0.12);
                border-color: rgba(74, 144, 217, 0.4);
                color: #1d4ed8;
                font-weight: 600;
            }

            &:hover:not(&--active) {
                background: rgba(74, 144, 217, 0.06);
                border-color: rgba(74, 144, 217, 0.25);
            }

            &:focus-visible {
                outline: 2px solid #4a90d9;
                outline-offset: 2px;
            }
        }

        .le-conj__table-wrapper {
            overflow-x: auto;
            border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .le-conj__table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }

        .le-conj__table th {
            text-align: left;
            padding: 0.3rem 0.75rem;
            background: var(--color-table-header);
            color: var(--color-table-header-text);
            font-weight: 600;
            font-size: 0.78rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            border-bottom: 1px solid var(--color-table-header-border);
        }

        .le-conj__table td {
            padding: 0.4rem 0.75rem;
            border-bottom: 1px solid var(--color-table-row-border);
            color: var(--color-text);
        }

        .le-conj__table tbody tr:last-child td {
            border-bottom: none;
        }

        .le-conj__table tbody tr:nth-child(even) td {
            background: var(--color-table-row-alt);
        }

        .le-conj__pronoun {
            font-weight: 500;
            color: var(--color-indications, #6b7280);
            white-space: nowrap;
        }

        .le-conj__ending {
            font-weight: 700;
            color: #1d4ed8;
            font-family: monospace;
            font-size: 0.85rem;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonConjugation {
    readonly element = input.required<ElementTypeObj>();

    protected readonly activeIndex = signal(0);

    protected readonly verbs = computed<VerbData[]>(() => (this.element() as Conjugation).verbs ?? []);
    protected readonly activeVerb = computed<VerbData | null>(() => this.verbs()[this.activeIndex()] ?? null);
}
