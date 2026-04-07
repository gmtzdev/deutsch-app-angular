import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';
import { Table } from '../../../core/models/elements/table.model';

@Component({
    selector: 'app-lesson-table',
    template: `
        <div class="le-table-wrapper" role="region" [attr.aria-label]="caption()">
            <table class="le-table">
                @if (headers().length) {
                <thead>
                    <tr>
                        @for (header of headers(); track $index) {
                        <th class="le-table__th" scope="col">{{ header }}</th>
                        }
                    </tr>
                </thead>
                }
                <tbody>
                    @for (row of rows(); track row.id) {
                    <tr class="le-table__tr">
                        @for (cell of row.cells; track $index) {
                        <td class="le-table__td">{{ cell }}</td>
                        }
                    </tr>
                    }
                </tbody>
            </table>
        </div>
    `,
    styles: [`
        .le-table-wrapper {
            overflow-x: auto;
            margin: 0.5rem 0;
            border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .le-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }

        .le-table__th {
            padding: 8px 12px;
            text-align: left;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--color-indications, #9b9a97);
            letter-spacing: 0.04em;
            text-transform: uppercase;
            background: rgba(0, 0, 0, 0.03);
            border-bottom: 1.5px solid rgba(0, 0, 0, 0.1);
        }

        .le-table__tr {
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);

            &:last-child {
                border-bottom: none;
            }

            &:nth-child(even) {
                background: rgba(0, 0, 0, 0.015);
            }
        }

        .le-table__td {
            padding: 8px 12px;
            color: var(--color-text, #37352f);
            line-height: 1.5;
            vertical-align: top;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonTable {
    readonly element = input.required<ElementTypeObj>();

    protected readonly headers = computed(() => (this.element() as Table).headers ?? []);
    protected readonly rows = computed(() => (this.element() as Table).rows ?? []);
    protected readonly caption = computed(() => {
        const h = this.headers();
        return h.length ? `Tabla: ${h.join(', ')}` : 'Tabla';
    });
}
