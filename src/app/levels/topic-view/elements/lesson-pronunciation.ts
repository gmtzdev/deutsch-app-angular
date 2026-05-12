import {
    Component,
    ChangeDetectionStrategy,
    input,
    signal,
    computed,
    PLATFORM_ID,
    inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ElementTypeObj } from '../../../core/types';
import { PronunciationBlock } from '../../../core/models/elements/pronunciation-block.model';
import { PronunciationItem } from '../../../core/models/elements/pronunciation-item.model';

@Component({
    selector: 'app-lesson-pronunciation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="lp-wrapper">
            <div class="lp-grid" role="list" aria-label="Elementos de pronunciación">
                @for (item of items(); track item.id) {
                <div class="lp-item" role="listitem">
                    <span class="lp-item__text">{{ item.label || item.text }}</span>
                    <button
                        type="button"
                        class="lp-item__btn"
                        [class.lp-item__btn--speaking]="speakingId() === item.id"
                        (click)="speak(item)"
                        [attr.aria-label]="'Reproducir: ' + (item.label || item.text)"
                        [attr.aria-pressed]="speakingId() === item.id">
                        @if (speakingId() === item.id) {
                            <span class="lp-item__icon" aria-hidden="true">■</span>
                            <span>Detener</span>
                        } @else {
                            <span class="lp-item__icon" aria-hidden="true">▶</span>
                            <span>Escuchar</span>
                        }
                    </button>
                </div>
                }
            </div>
        </div>
    `,
    styles: [`
        .lp-wrapper {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .lp-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 0.75rem;
        }

        .lp-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 0.75rem;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
        }

        .lp-item__text {
            font-size: 1.4rem;
            font-weight: 700;
            color: #1f2937;
            text-align: center;
            word-break: break-word;
        }

        .lp-item__btn {
            display: flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.3rem 0.85rem;
            font-size: 0.8rem;
            font-weight: 600;
            border: 1.5px solid #6366f1;
            border-radius: 999px;
            background: #fff;
            color: #4f46e5;
            cursor: pointer;
            transition: all 0.15s;
            white-space: nowrap;
        }

        .lp-item__btn:hover,
        .lp-item__btn--speaking {
            background: #4f46e5;
            color: #fff;
        }

        .lp-item__icon {
            font-size: 0.7rem;
        }
    `],
})
export class LessonPronunciation {
    private readonly platformId = inject(PLATFORM_ID);

    readonly element = input.required<ElementTypeObj>();

    protected readonly items = computed(() => (this.element() as PronunciationBlock).items ?? []);
    protected readonly speakingId = signal<number | null>(null);

    protected speak(item: PronunciationItem): void {
        if (!isPlatformBrowser(this.platformId)) return;

        if (this.speakingId() === item.id) {
            window.speechSynthesis.cancel();
            this.speakingId.set(null);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(item.text);
        utterance.lang = 'de-DE';
        utterance.rate = 0.8;
        utterance.onend = () => this.speakingId.set(null);
        utterance.onerror = () => this.speakingId.set(null);
        this.speakingId.set(item.id);
        window.speechSynthesis.speak(utterance);
    }
}
