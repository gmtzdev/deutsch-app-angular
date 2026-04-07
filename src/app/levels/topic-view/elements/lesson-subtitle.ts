import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';

@Component({
    selector: 'app-lesson-subtitle',
    template: `<h3 class="le-subtitle text-indications">{{ element().text }}</h3>`,
    styles: [`
        .le-subtitle {
            font-size: 1.05rem;
            font-weight: 600;
            margin-top: 0.5rem;
            margin-bottom: 1.5rem;
            line-height: 1.4;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonSubtitle {
    readonly element = input.required<ElementTypeObj>();
}
