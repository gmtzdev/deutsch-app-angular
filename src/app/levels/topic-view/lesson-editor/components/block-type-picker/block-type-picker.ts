import { Component, ChangeDetectionStrategy, EventEmitter, output } from "@angular/core";

const BLOCK_OPTIONS: BlockOption[] = [
    { type: 'title', label: 'Título', icon: 'H1', description: 'Encabezado principal de sección' },
    { type: 'subtitle', label: 'Subtítulo', icon: 'H2', description: 'Encabezado secundario' },
    { type: 'element', label: 'Párrafo', icon: '¶', description: 'Texto de contenido' },
    { type: 'separator', label: 'Separador', icon: '—', description: 'Línea divisoria entre secciones' },
    { type: 'unorderedList', label: 'Lista', icon: '≡', description: 'Lista de ítems' },
    { type: 'table', label: 'Tabla', icon: '⊞', description: 'Tabla con filas y columnas' },
    { type: 'tip', label: 'Consejo', icon: '💡', description: 'Bloque de consejo o nota' },
    { type: 'tag', label: 'Etiqueta', icon: '🏷', description: 'Etiqueta corta de 1 a 3 palabras' },
    { type: 'conjugation', label: 'Conjugación', icon: '📝', description: 'Tabla de conjugación verbal (alemán)' },
    { type: 'quiz', label: 'Quiz', icon: '❓', description: 'Preguntas de comprensión' },
    { type: 'image', label: 'Imagen', icon: '🖼', description: 'Imagen desde una URL' },
    { type: 'dragDrop', label: 'Arrastrar y soltar', icon: '🎯', description: 'Completar espacios arrastrando palabras' },
    { type: 'alphabetBlock', label: 'Alfabeto alemán', icon: '🔤', description: 'Cuadrícula interactiva del alfabeto alemán con pronunciación' },
    { type: 'pronunciationBlock', label: 'Pronunciación', icon: '🔊', description: 'Cuadrícula de textos reproducibles con voz alemana' },
    { type: 'fillBlank', label: 'Completar oración', icon: '✍️', description: 'Rellenar los espacios en blanco de una oración' },
    { type: 'fillBlankTable', label: 'Tabla completar espacios', icon: '🧩', description: 'Ejercicio en tabla para completar espacios en blanco' },
    { type: 'textQuestion', label: 'Pregunta abierta', icon: '💬', description: 'Preguntas con respuesta en texto libre' },
    { type: 'multipleChoice', label: 'Opción múltiple', icon: '✅', description: 'Preguntas con opciones y una respuesta correcta' },
];

@Component({
    selector: 'app-block-type-picker',
    templateUrl: './block-type-picker.html',
    styleUrl: './block-type-picker.scss',
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockTypePicker {
    protected readonly blockOptions = BLOCK_OPTIONS;

    readonly onSelectType = output<BlockType>();
    readonly onClosePicker = output<void>();

    protected selectType(type: BlockType): void {
        this.onSelectType.emit(type);
    }

    protected closePicker(): void {
        this.onClosePicker.emit();
    }


}