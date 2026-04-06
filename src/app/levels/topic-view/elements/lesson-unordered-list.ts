import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';
import { UnorderedList } from '../../../core/models/elements/unorderedlist.model';

@Component({
    selector: 'app-lesson-unordered-list',
    template: `
        <ul class="le-ul" role="list">
            @for (item of items(); track item.id) {
            <li class="le-li">{{ item.text }}</li>
            }
        </ul>
    `,
    styles: [`
        .le-ul {
            margin: 0.5rem 0 0.5rem 1.25rem;
            padding: 0;
            list-style: disc;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        .le-li {
            font-size: 0.95rem;
            color: var(--color-text, #37352f);
            line-height: 1.6;
            padding-left: 0.25rem;
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
