import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';

@Component({
    selector: 'app-lesson-subtitle',
    template: `<h3 class="le-subtitle">{{ element().text }}</h3>`,
    styles: [`
        .le-subtitle {
            font-size: 1.05rem;
            font-weight: 600;
            color: var(--color-text, #37352f);
            margin: 1rem 0 0.35rem;
            line-height: 1.4;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonSubtitle {
    readonly element = input.required<ElementTypeObj>();
}
