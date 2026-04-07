import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';
import { Tip } from '../../../core/models/elements/tip.model';

type ColorScheme = { bg: string; borderColor: string; titleColor: string };

const COLOR_SCHEMES: Record<string, ColorScheme> = {
    info: { bg: 'rgba(74, 144, 217, 0.08)', borderColor: '#4a90d9', titleColor: '#1e5fa8' },
    warning: { bg: 'rgba(245, 158, 11, 0.08)', borderColor: '#f59e0b', titleColor: '#b45309' },
    success: { bg: 'rgba(34, 197, 94, 0.08)', borderColor: '#22c55e', titleColor: '#15803d' },
    danger: { bg: 'rgba(239, 68, 68, 0.08)', borderColor: '#ef4444', titleColor: '#b91c1c' },
};

@Component({
    selector: 'app-lesson-tip',
    template: `
        <aside class="le-tip"
            [style.background]="scheme().bg"
            [style.border-left-color]="scheme().borderColor"
            role="note">
            @if (tipTitle()) {
            <p class="le-tip__title" [style.color]="scheme().titleColor">
                {{ tipTitle() }}
            </p>
            }
            <p class="le-tip__text">{{ text() }}</p>
        </aside>
    `,
    styles: [`
        .le-tip {
            margin: 0.5rem 0;
            padding: 10px 14px;
            border-left: 3.5px solid transparent;
            border-radius: 0 8px 8px 0;
        }

        .le-tip__title {
            margin: 0 0 4px;
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .le-tip__text {
            margin: 0;
            font-size: 0.9rem;
            color: var(--color-text, #37352f);
            line-height: 1.6;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonTip {
    readonly element = input.required<ElementTypeObj>();

    protected readonly scheme = computed(
        () => COLOR_SCHEMES[(this.element() as Tip).style] ?? COLOR_SCHEMES['info']
    );

    protected readonly tipTitle = computed(() => (this.element() as Tip).tipTitle ?? '');
    protected readonly text = computed(() => this.element().text);
}
