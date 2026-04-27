import { Component, ChangeDetectionStrategy, input, inject, computed } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TextTransformService } from '../../../core/services/text-transform.service';

@Component({
    selector: 'app-lesson-paragraph',
    template: `<p class="le-paragraph" [innerHTML]="safeHtml()"></p>`,
    styles: [`
        .le-paragraph {
            font-size: 0.95rem;
            color: var(--color-text, #37352f);
            line-height: 1.7;
            margin: 0.4rem 0;

            strong {
                font-weight: 700;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonParagraph {
    readonly element = input.required<ElementTypeObj>();
    private readonly textTransformService = inject(TextTransformService);
    protected readonly safeHtml = computed(() => this.textTransformService.toSafeHtml(this.element().text ?? ''));
}
