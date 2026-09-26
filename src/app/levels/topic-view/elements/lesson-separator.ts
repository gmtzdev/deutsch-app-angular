import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';

@Component({
    selector: 'app-lesson-separator',
    template: `
    <hr class="lesson-separator"
                        [class.lesson-separator--dashed]="element().style === 'dashed'"
                        [class.lesson-separator--double]="element().style === 'double'"
                        [class.lesson-separator--dots]="element().style === 'dots'"
                        aria-hidden="true" />
    `,
    styles: [`
        .lesson-separator {
            width: 100%;
            border: 0;
            border-top: 1px solid rgba(107, 114, 128, 0.35);
            margin: 1rem 0;

            &--dashed {
                border-top-style: dashed;
            }

            &--double {
                border-top: 3px solid rgba(107, 114, 128, 0.45);
            }

            &--dots {
                border-top-style: dotted;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonSeparator {
    readonly element = input.required<ElementTypeObj>();
}
