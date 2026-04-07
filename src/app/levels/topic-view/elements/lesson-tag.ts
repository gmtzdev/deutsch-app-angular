import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { ElementTypeObj } from '../../../core/types';

const COLOR_SCHEMES: Record<string, { bg: string; border: string; color: string }> = {
    blue: { bg: 'rgba(74, 144, 217, 0.15)', border: '#4a90d9', color: '#1d4ed8' },
    green: { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', color: '#15803d' },
    purple: { bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7', color: '#7e22ce' },
    orange: { bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316', color: '#c2410c' },
    red: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', color: '#b91c1c' },
    gray: { bg: 'rgba(107, 114, 128, 0.12)', border: '#6b7280', color: '#374151' },
};

@Component({
    selector: 'app-lesson-tag',
    template: `
        <span class="le-tag"
            [style.background]="scheme().bg"
            [style.border-color]="scheme().border"
            [style.color]="scheme().color">
            {{ element().text }}
        </span>`,
    styles: [`
        .le-tag {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            border: 1px solid;
            line-height: 1.6;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonTag {
    readonly element = input.required<ElementTypeObj>();
    protected readonly scheme = computed(() => COLOR_SCHEMES[this.element().style] ?? COLOR_SCHEMES['blue']);
}
