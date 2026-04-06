import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';

@Component({
    selector: 'app-lesson-paragraph',
    template: `<p class="le-paragraph">{{ element().text }}</p>`,
    styles: [`
        .le-paragraph {
            font-size: 0.95rem;
            color: var(--color-text, #37352f);
            line-height: 1.7;
            margin: 0.4rem 0;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonParagraph {
    readonly element = input.required<ElementTypeObj>();
}
