import { Component, ChangeDetectionStrategy, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface LetterData {
    letter: string;
    name: string;
    example: string;
    ipa: string;
}

const ALPHABET: LetterData[] = [
    { letter: 'A', name: 'A — [aː]', example: 'der Apfel (la manzana)', ipa: 'aː' },
    { letter: 'B', name: 'B — [beː]', example: 'das Buch (el libro)', ipa: 'beː' },
    { letter: 'C', name: 'C — [tseː]', example: 'der Computer (el ordenador)', ipa: 'tseː' },
    { letter: 'D', name: 'D — [deː]', example: 'die Dose (la lata)', ipa: 'deː' },
    { letter: 'E', name: 'E — [eː]', example: 'das Ei (el huevo)', ipa: 'eː' },
    { letter: 'F', name: 'F — [ɛf]', example: 'die Flasche (la botella)', ipa: 'ɛf' },
    { letter: 'G', name: 'G — [ɡeː]', example: 'das Glas (el vaso)', ipa: 'ɡeː' },
    { letter: 'H', name: 'H — [haː]', example: 'das Haus (la casa)', ipa: 'haː' },
    { letter: 'I', name: 'I — [iː]', example: 'die Insel (la isla)', ipa: 'iː' },
    { letter: 'J', name: 'J — [jɔt]', example: 'das Jahr (el año)', ipa: 'jɔt' },
    { letter: 'K', name: 'K — [kaː]', example: 'die Katze (el gato)', ipa: 'kaː' },
    { letter: 'L', name: 'L — [ɛl]', example: 'die Lampe (la lámpara)', ipa: 'ɛl' },
    { letter: 'M', name: 'M — [ɛm]', example: 'die Mutter (la madre)', ipa: 'ɛm' },
    { letter: 'N', name: 'N — [ɛn]', example: 'die Nacht (la noche)', ipa: 'ɛn' },
    { letter: 'O', name: 'O — [oː]', example: 'das Obst (la fruta)', ipa: 'oː' },
    { letter: 'P', name: 'P — [peː]', example: 'das Papier (el papel)', ipa: 'peː' },
    { letter: 'Q', name: 'Q — [kuː]', example: 'die Quelle (la fuente)', ipa: 'kuː' },
    { letter: 'R', name: 'R — [ɛʁ]', example: 'der Regen (la lluvia)', ipa: 'ɛʁ' },
    { letter: 'S', name: 'S — [ɛs]', example: 'die Sonne (el sol)', ipa: 'ɛs' },
    { letter: 'T', name: 'T — [teː]', example: 'die Tür (la puerta)', ipa: 'teː' },
    { letter: 'U', name: 'U — [uː]', example: 'die Uhr (el reloj)', ipa: 'uː' },
    { letter: 'V', name: 'V — [faʊ]', example: 'der Vogel (el pájaro)', ipa: 'faʊ' },
    { letter: 'W', name: 'W — [veː]', example: 'das Wasser (el agua)', ipa: 'veː' },
    { letter: 'X', name: 'X — [ɪks]', example: 'das Xylophon (el xilófono)', ipa: 'ɪks' },
    { letter: 'Y', name: 'Y — [ʏpsilɔn]', example: 'der Yoghurt (el yogur)', ipa: 'ʏpsilɔn' },
    { letter: 'Z', name: 'Z — [tsɛt]', example: 'der Zug (el tren)', ipa: 'tsɛt' },
    { letter: 'Ä', name: 'Ä — [ɛː]', example: 'die Äpfel (las manzanas)', ipa: 'ɛː' },
    { letter: 'Ö', name: 'Ö — [øː]', example: 'der Öl (el aceite)', ipa: 'øː' },
    { letter: 'Ü', name: 'Ü — [yː]', example: 'die Übung (el ejercicio)', ipa: 'yː' },
    { letter: 'ß', name: 'ß — [ɛstsɛt]', example: 'die Straße (la calle)', ipa: 'ɛstsɛt' },
];

@Component({
    selector: 'app-lesson-alphabet',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="la-wrapper">
            <div class="la-grid" role="list" aria-label="Alfabeto alemán">
                @for (item of alphabet; track item.letter) {
                <button
                    type="button"
                    class="la-btn"
                    role="listitem"
                    [class.la-btn--active]="activeLetter()?.letter === item.letter"
                    [attr.aria-pressed]="activeLetter()?.letter === item.letter"
                    [attr.aria-label]="item.name"
                    (click)="selectLetter(item)">
                    {{ item.letter }}
                </button>
                }
            </div>

            @if (activeLetter(); as active) {
            <div class="la-detail" role="region" aria-label="Detalle de la letra {{ active.letter }}">
                <span class="la-detail__letter" aria-hidden="true">{{ active.letter }}</span>
                <div class="la-detail__info">
                    <p class="la-detail__name">{{ active.name }}</p>
                    <p class="la-detail__example">{{ active.example }}</p>
                    <button
                        type="button"
                        class="la-play-btn"
                        (click)="speak(active)"
                        aria-label="Escuchar pronunciación de {{ active.letter }}">
                        ▶ Escuchar
                    </button>
                </div>
            </div>
            }
        </div>
    `,
    styles: [`
        .la-wrapper {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }

        .la-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
            gap: 0.5rem;
        }

        .la-btn {
            aspect-ratio: 1;
            font-size: 1.15rem;
            font-weight: 700;
            border: 1.5px solid #e5e7eb;
            border-radius: 10px;
            background: #fff;
            color: #1f2937;
            cursor: pointer;
            transition: all 0.15s;
        }

        .la-btn:hover {
            border-color: #6366f1;
            color: #4f46e5;
            background: #eef2ff;
        }

        .la-btn--active {
            background: #4f46e5;
            color: #fff;
            border-color: #4f46e5;
            box-shadow: 0 2px 8px rgba(79, 70, 229, 0.35);
        }

        .la-detail {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            padding: 1.25rem 1.5rem;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
        }

        .la-detail__letter {
            font-size: 4rem;
            font-weight: 800;
            color: #4f46e5;
            line-height: 1;
            min-width: 60px;
            text-align: center;
        }

        .la-detail__info {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
        }

        .la-detail__name {
            font-size: 1rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
        }

        .la-detail__example {
            font-size: 0.9rem;
            color: #6b7280;
            margin: 0;
        }

        .la-play-btn {
            margin-top: 0.5rem;
            padding: 0.35rem 0.9rem;
            font-size: 0.85rem;
            font-weight: 600;
            border: 1.5px solid #6366f1;
            border-radius: 999px;
            background: #fff;
            color: #4f46e5;
            cursor: pointer;
            width: fit-content;
            transition: all 0.15s;
        }

        .la-play-btn:hover {
            background: #4f46e5;
            color: #fff;
        }
    `],
})
export class LessonAlphabet {
    private readonly platformId = inject(PLATFORM_ID);

    protected readonly alphabet = ALPHABET;
    protected readonly activeLetter = signal<LetterData | null>(null);

    protected selectLetter(item: LetterData): void {
        this.activeLetter.set(
            this.activeLetter()?.letter === item.letter ? null : item,
        );
    }

    protected speak(item: LetterData): void {
        if (!isPlatformBrowser(this.platformId)) return;
        const utterance = new SpeechSynthesisUtterance(item.letter);
        utterance.lang = 'de-DE';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    }
}
