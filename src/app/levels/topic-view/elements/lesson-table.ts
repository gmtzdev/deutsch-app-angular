import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';
import { Table } from '../../../core/models/elements/table.model';

@Component({
    selector: 'app-lesson-table',
    template: `
        <div class="le-table-wrapper" role="region" [attr.aria-label]="caption()">
            <table class="vocab-table">
                @if (headers().length) {
                <thead>
                    <tr>
                        @for (header of headers(); track $index) {
                        <th scope="col">{{ header }}</th>
                        }
                    </tr>
                </thead>
                }
                <tbody>
                    @for (row of rows(); track row.id) {
                    <tr>
                        @for (cell of row.cells; track $index) {
                        <td>{{ cell }}</td>
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

        .vocab-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }

        .vocab-table th {
            text-align: left;
            padding: 0.3rem 0.6rem;
            background: var(--color-table-header);
            color: var(--color-table-header-text);
            font-weight: 600;
            font-size: 0.78rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            border-bottom: 1px solid var(--color-table-header-border);
        }

        .vocab-table td {
            padding: 0.4rem 0.6rem;
            border-bottom: 1px solid var(--color-table-row-border);
            color: var(--color-text);
        }

        .vocab-table tr:last-child td {
            border-bottom: none;
        }

        .vocab-table tr:hover td {
            background: var(--color-table-row-hover);
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
