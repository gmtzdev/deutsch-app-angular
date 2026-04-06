import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';

@Component({
    selector: 'app-lesson-title',
    template: `<h1 class="le-title">{{ element().text }}</h1>`,
    styles: [`
        .le-title {
            font-size: 1.7rem;
            font-weight: 700;
            color: var(--color-title, #1a1a1a);
            margin: 0;
            margin: 1.25rem 0 0.5rem;
            line-height: 1.3;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonTitle {
    readonly element = input.required<ElementTypeObj>();
}
