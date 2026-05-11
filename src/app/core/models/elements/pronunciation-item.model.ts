export interface PronunciationItem {
    id: number;
    /** Texto que se reproducirá con voz */
    text: string;
    /** Etiqueta visible (si está vacía se muestra `text`) */
    label: string;
}
