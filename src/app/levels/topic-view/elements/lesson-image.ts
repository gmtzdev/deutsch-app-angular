import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';

@Component({
    selector: 'app-lesson-image',
    template: `
        <figure class="le-image">
            @if (src()) {
            <img class="le-image__img" [src]="src()" [alt]="altText()" />
            } @else {
            <div class="le-image__placeholder" aria-hidden="true">
                <span>🖼</span>
                <span>Sin imagen</span>
            </div>
            }
            @if (altText()) {
            <figcaption class="le-image__caption">{{ altText() }}</figcaption>
            }
        </figure>
    `,
    styles: [`
        .le-image {
            margin: 0.5rem 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.375rem;
        }

        .le-image__img {
            max-width: 100%;
            border-radius: 8px;
            display: block;
            object-fit: contain;
            border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .le-image__placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            width: 100%;
            min-height: 120px;
            border-radius: 8px;
            border: 2px dashed rgba(0, 0, 0, 0.15);
            background: rgba(0, 0, 0, 0.03);
            color: var(--color-indications, #9b9a97);
            font-size: 12px;

            span:first-child {
                font-size: 28px;
            }
        }

        .le-image__caption {
            font-size: 12px;
            color: var(--color-indications, #6b7280);
            font-style: italic;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonImage {
    readonly element = input.required<ElementTypeObj>();

    protected readonly src = computed(() => this.element().text);
    protected readonly altText = computed(() => this.element().style);
}
