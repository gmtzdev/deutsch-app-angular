import { ChangeDetectionStrategy, Component, model } from '@angular/core';

export type SeparatorStyle = 'line' | 'dashed' | 'double' | 'dots';

interface SeparatorOption {
    value: SeparatorStyle;
    label: string;
    description: string;
}

const SEPARATOR_OPTIONS: SeparatorOption[] = [
    { value: 'line', label: 'Línea', description: 'Línea simple' },
    { value: 'dashed', label: 'Punteada', description: 'Línea segmentada' },
    { value: 'double', label: 'Doble', description: 'Línea doble' },
    { value: 'dots', label: 'Puntos', description: 'Línea de puntos' },
];

@Component({
    selector: 'app-editor-separator',
    templateUrl: './separator.component.html',
    styleUrls: ['./separator.component.scss', '../lesson-editor.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeparatorComponent {
    public separatorStyle = model<SeparatorStyle>('line');

    protected readonly options = SEPARATOR_OPTIONS;

    protected selectStyle(value: SeparatorStyle): void {
        this.separatorStyle.set(value);
    }
}
