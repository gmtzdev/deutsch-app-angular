import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';
import { UnorderedList } from '../../../core/models/elements/unorderedlist.model';

@Component({
    selector: 'app-lesson-unordered-list',
    template: `
        <ul class="obj-list" role="list">
            @for (item of items(); track item.id) {
            
            <li>
                <span class="dot dot-blue"></span>
                {{ item.text }}
            </li>
            }
        </ul>
    `,
    styles: [`
        .obj-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .obj-list li {
            display: flex;
            align-items: center;
            gap: 0.55rem;
            font-size: 0.95rem;
        }

        .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .dot-blue {
            background: #3b82f6;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonUnorderedList {
    readonly element = input.required<ElementTypeObj>();

    protected readonly items = computed(() =>
        (this.element() as UnorderedList).list ?? []
    );
}
