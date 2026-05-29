import {
    Component,
    ChangeDetectionStrategy,
    inject,
    input,
    output,
    signal,
    computed,
    DOCUMENT,
} from '@angular/core';
import { ElementTypeObj } from '../../../core/types';
import { UnorderedList } from '../../../core/models/elements/unorderedlist.model';
import { ListItem } from '../../../core/models/elements/listitem.model';
import { Table } from '../../../core/models/elements/table.model';
import { TableRow } from '../../../core/models/elements/table-row.model';
import { Tip } from '../../../core/models/elements/tip.model';
import { Title } from '../../../core/models/elements/title.model';
import { Subtitle } from '../../../core/models/elements/subtitle.model';
import { Element } from '../../../core/models/elements/element.model';
import { LessonTitle } from '../elements/lesson-title';
import { LessonSubtitle } from '../elements/lesson-subtitle';
import { LessonParagraph } from '../elements/lesson-paragraph';
import { LessonUnorderedList } from '../elements/lesson-unordered-list';
import { LessonTable } from '../elements/lesson-table';
import { LessonTip } from '../elements/lesson-tip';
import { LessonTag } from '../elements/lesson-tag';
import { Tag } from '../../../core/models/elements/tag.model';
import { LessonConjugation } from '../elements/lesson-conjugation';
import { Conjugation } from '../../../core/models/elements/conjugation.model';
import { VerbData } from '../../../core/models/elements/verb-data.model';
import { ConjugationRow } from '../../../core/models/elements/conjugation-row.model';
import { LessonQuiz } from '../elements/lesson-quiz';
import { Quiz } from '../../../core/models/elements/quiz.model';
import { QuizQuestion } from '../../../core/models/elements/quiz-question.model';
import { LessonImage } from '../elements/lesson-image';
import { ImageBlock } from '../../../core/models/elements/image-block.model';
import { LessonDragDrop } from '../elements/lesson-drag-drop';
import { LessonAlphabet } from '../elements/lesson-alphabet';
import { AlphabetBlock } from '../../../core/models/elements/alphabet-block.model';
import { LessonPronunciation } from '../elements/lesson-pronunciation';
import { PronunciationBlock } from '../../../core/models/elements/pronunciation-block.model';
import { PronunciationItem } from '../../../core/models/elements/pronunciation-item.model';
import { DragDropExercise } from '../../../core/models/elements/drag-drop-exercise.model';
import { DragDropRow } from '../../../core/models/elements/drag-drop-row.model';
import { FillBlankExercise } from '../../../core/models/elements/fill-blank-exercise.model';
import { FillBlankTableExercise } from '../../../core/models/elements/fill-blank-table-exercise.model';
import { FillBlankRow } from '../../../core/models/elements/fill-blank-row.model';
import { LessonFillBlank } from '../elements/lesson-fill-blank';
import { LessonFillBlankTable } from '../elements/lesson-fill-blank-table-simple';
import { CurriculumService } from '../../../core/services/curriculum.service';
import { environment } from '../../../../environments/environment';

type BlockType = 'title' | 'subtitle' | 'element' | 'unorderedList' | 'table' | 'tip' | 'tag' | 'conjugation' | 'quiz' | 'image' | 'dragDrop' | 'alphabetBlock' | 'pronunciationBlock' | 'fillBlank' | 'fillBlankTable';
type TipColor = 'info' | 'warning' | 'success' | 'danger';
type TagColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';

interface TipColorOption {
    value: TipColor;
    label: string;
    bg: string;
    border: string;
}

interface TagColorOption {
    value: TagColor;
    label: string;
    bg: string;
    border: string;
    color: string;
}

interface BlockOption {
    type: BlockType;
    label: string;
    icon: string;
    description: string;
}

interface FillBlankTableCellDraft {
    text: string;
    editable: boolean;
    answer: string;
}

interface FillBlankTableRowDraft {
    id: number;
    cells: FillBlankTableCellDraft[];
}

interface FillBlankTableStoredCell {
    text: string;
    editable: boolean;
    answer: string;
}

interface FillBlankTableStoredRow {
    cells: FillBlankTableStoredCell[];
}

interface FillBlankTableStoredStyle {
    headers: string[];
}

const BLOCK_OPTIONS: BlockOption[] = [
    { type: 'title', label: 'Título', icon: 'H1', description: 'Encabezado principal de sección' },
    { type: 'subtitle', label: 'Subtítulo', icon: 'H2', description: 'Encabezado secundario' },
    { type: 'element', label: 'Párrafo', icon: '¶', description: 'Texto de contenido' },
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
];

const TIP_COLOR_OPTIONS: TipColorOption[] = [
    { value: 'info', label: 'Información', bg: 'rgba(74, 144, 217, 0.15)', border: '#4a90d9' },
    { value: 'warning', label: 'Advertencia', bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b' },
    { value: 'success', label: 'Correcto', bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e' },
    { value: 'danger', label: 'Importante', bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444' },
];

const TAG_COLOR_OPTIONS: TagColorOption[] = [
    { value: 'blue', label: 'Azul', bg: 'rgba(74, 144, 217, 0.15)', border: '#4a90d9', color: '#1d4ed8' },
    { value: 'green', label: 'Verde', bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', color: '#15803d' },
    { value: 'purple', label: 'Morado', bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7', color: '#7e22ce' },
    { value: 'orange', label: 'Naranja', bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316', color: '#c2410c' },
    { value: 'red', label: 'Rojo', bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', color: '#b91c1c' },
    { value: 'gray', label: 'Gris', bg: 'rgba(107, 114, 128, 0.12)', border: '#6b7280', color: '#374151' },
];

@Component({
    selector: 'app-lesson-editor',
    templateUrl: './lesson-editor.html',
    styleUrl: './lesson-editor.scss',
    imports: [LessonTitle, LessonSubtitle, LessonParagraph, LessonUnorderedList, LessonTable, LessonTip, LessonTag, LessonConjugation, LessonQuiz, LessonImage, LessonDragDrop, LessonAlphabet, LessonPronunciation, LessonFillBlank, LessonFillBlankTable],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonEditor {
    readonly pendingElements = input<ElementTypeObj[]>([]);
    readonly elementAdded = output<ElementTypeObj>();
    readonly elementEdited = output<{ index: number; element: ElementTypeObj }>();
    readonly elementRemoved = output<number>();
    readonly elementReordered = output<{ from: number; to: number }>();

    protected readonly hasPending = computed(() => this.pendingElements().length > 0);
    protected readonly editingIndex = signal<number | null>(null);

    // ── Drag-and-drop state ─────────────────────────────────
    protected readonly dragFromIndex = signal<number | null>(null);
    protected readonly dragOverIndex = signal<number | null>(null);

    private readonly doc = inject(DOCUMENT);
    private readonly curriculumService = inject(CurriculumService);

    protected readonly blockOptions = BLOCK_OPTIONS;

    protected readonly pickerOpen = signal(false);
    protected readonly activeType = signal<BlockType | null>(null);
    protected readonly inputText = signal('');
    protected readonly listItems = signal<string[]>(['']);
    protected readonly tableHeaders = signal<string[]>(['', '']);
    protected readonly tableRows = signal<string[][]>([['', '']]);
    protected readonly tipTitle = signal('');
    protected readonly tipColor = signal<TipColor>('info');
    protected readonly tagColor = signal<TagColor>('blue');

    // ── Conjugation signals ─────────────────────────────────
    protected readonly conjVerbs = signal<VerbData[]>([{ name: '', rows: this.defaultConjRows() }]);
    protected readonly conjActiveVerb = signal(0);

    // ── Quiz signals ──────────────────────────────────────────
    protected readonly quizQuestions = signal<QuizQuestion[]>([{ id: 1, question: '', answer: '', hint: '' }]);

    // ── Image signals ─────────────────────────────────────────
    protected readonly imageUrl = signal('');
    protected readonly imageAlt = signal('');
    protected readonly imageMode = signal<'url' | 'file'>('url');
    protected readonly imageFileName = signal('');
    protected readonly imageUploading = signal(false);

    // ── Drag-drop signals ─────────────────────────────────────
    protected readonly dragDropWords = signal<string[]>(['']);
    protected readonly dragDropRows = signal<DragDropRow[]>([{ id: 1, before: '', after: '', answer: '' }]);

    // ── Pronunciation signals ─────────────────────────────────
    protected readonly pronunciationItems = signal<PronunciationItem[]>([{ id: 1, text: '', label: '' }]);
    // ── Fill-blank signals ────────────────────────────────────
    protected readonly fillBlankRows = signal<FillBlankRow[]>([{ id: 1, sentence: '', answers: [''] }]);
    protected readonly fillBlankTableCols = signal(3);
    protected readonly fillBlankTableHeaders = signal<string[]>(['Col 1', 'Col 2', 'Col 3']);
    protected readonly fillBlankTableRows = signal<FillBlankTableRowDraft[]>(this.createFillBlankTableRows(3));
    // ── Grid signals ───────────────────────────────────────────────
    protected readonly gridEnabled = signal(false);
    protected readonly activeGridCols = signal(2);
    /** null = crear nuevo grid al guardar; string = unirse a grid existente */
    protected readonly activeGridId = signal<string | null>(null);

    protected readonly existingGrids = computed(() => {
        const seen = new Map<string, { cols: number; num: number }>();
        let counter = 1;
        for (const el of this.pendingElements()) {
            if (el.gridId && !seen.has(el.gridId)) {
                seen.set(el.gridId, { cols: el.gridCols ?? 2, num: counter++ });
            }
        }
        return [...seen.entries()].map(([id, { cols, num }]) => ({ id, cols, num }));
    });
    protected readonly tipColorOptions = TIP_COLOR_OPTIONS;
    protected readonly tagColorOptions = TAG_COLOR_OPTIONS;

    protected openPicker(): void {
        this.pickerOpen.set(true);
        this.activeType.set(null);
    }

    // ── Drag-and-drop handlers ─────────────────────────────

    protected onDragStart(event: DragEvent, index: number): void {
        this.dragFromIndex.set(index);
        event.dataTransfer!.effectAllowed = 'move';
    }

    protected onDragOver(event: DragEvent, index: number): void {
        event.preventDefault();
        event.dataTransfer!.dropEffect = 'move';
        this.dragOverIndex.set(index);
    }

    protected onDragLeave(index: number): void {
        if (this.dragOverIndex() === index) this.dragOverIndex.set(null);
    }

    protected onDrop(event: DragEvent, toIndex: number): void {
        event.preventDefault();
        const fromIndex = this.dragFromIndex();
        if (fromIndex === null || fromIndex === toIndex) {
            this.dragFromIndex.set(null);
            this.dragOverIndex.set(null);
            return;
        }
        this.elementReordered.emit({ from: fromIndex, to: toIndex });
        this.dragFromIndex.set(null);
        this.dragOverIndex.set(null);
    }

    protected onDragEnd(): void {
        this.dragFromIndex.set(null);
        this.dragOverIndex.set(null);
    }

    protected closePicker(): void {
        this.pickerOpen.set(false);
        this.activeType.set(null);
        this.inputText.set('');
        this.listItems.set(['']);
        this.tableHeaders.set(['', '']);
        this.tableRows.set([['', '']]);
        this.tipTitle.set('');
        this.tipColor.set('info');
        this.tagColor.set('blue');
        this.conjVerbs.set([{ name: '', rows: this.defaultConjRows() }]);
        this.conjActiveVerb.set(0);
        this.quizQuestions.set([{ id: 1, question: '', answer: '', hint: '' }]);
        this.imageUrl.set('');
        this.imageAlt.set('');
        this.imageMode.set('url');
        this.imageFileName.set('');
        this.imageUploading.set(false);
        this.dragDropWords.set(['']);
        this.dragDropRows.set([{ id: null, before: '', after: '', answer: '' }]);
        this.pronunciationItems.set([{ id: 1, text: '', label: '' }]);
        this.fillBlankRows.set([{ id: 1, sentence: '', answers: [''] }]);
        this.fillBlankTableCols.set(3);
        this.fillBlankTableHeaders.set(['Col 1', 'Col 2', 'Col 3']);
        this.fillBlankTableRows.set(this.createFillBlankTableRows(3));
        this.gridEnabled.set(false);
        this.activeGridCols.set(2);
        this.activeGridId.set(null);
        this.editingIndex.set(null);
    }

    protected selectType(type: BlockType): void {
        this.activeType.set(type);
        this.inputText.set('');
        this.listItems.set(['']);
        setTimeout(() => {
            const id = type === 'tip' ? 'editor-tip-title' : 'editor-main-input';
            (this.doc.getElementById(id) as HTMLElement | null)?.focus();
        }, 0);
    }

    protected backToPicker(): void {
        this.activeType.set(null);
        this.inputText.set('');
        this.listItems.set(['']);
        this.tableHeaders.set(['', '']);
        this.tableRows.set([['', '']]);
        this.tipTitle.set('');
        this.tipColor.set('info');
        this.tagColor.set('blue');
        this.conjVerbs.set([{ name: '', rows: this.defaultConjRows() }]);
        this.conjActiveVerb.set(0);
        this.quizQuestions.set([{ id: 1, question: '', answer: '', hint: '' }]);
        this.imageUrl.set('');
        this.imageAlt.set('');
        this.imageMode.set('url');
        this.imageFileName.set('');
        this.imageUploading.set(false);
        this.dragDropWords.set(['']);
        this.dragDropRows.set([{ id: null, before: '', after: '', answer: '' }]);
        this.pronunciationItems.set([{ id: 1, text: '', label: '' }]);
        this.fillBlankRows.set([{ id: 1, sentence: '', answers: [''] }]);
        this.fillBlankTableCols.set(3);
        this.fillBlankTableHeaders.set(['Col 1', 'Col 2', 'Col 3']);
        this.fillBlankTableRows.set(this.createFillBlankTableRows(3));
        this.gridEnabled.set(false);
        this.activeGridCols.set(2);
        this.activeGridId.set(null);
        this.editingIndex.set(null);
    }

    protected startEdit(index: number, element: ElementTypeObj): void {
        this.editingIndex.set(index);
        this.pickerOpen.set(true);
        const type = element.type as BlockType;
        this.activeType.set(type);
        if (type === 'unorderedList') {
            const ul = element as UnorderedList;
            this.listItems.set(ul.list.map((item) => item.text));
        } else if (type === 'table') {
            const table = element as Table;
            this.tableHeaders.set([...table.headers]);
            this.tableRows.set(table.rows.map((row) => [...row.cells]));
        } else if (type === 'tip') {
            const tip = element as Tip;
            this.inputText.set(tip.text);
            this.tipTitle.set(tip.tipTitle);
            this.tipColor.set(tip.style as TipColor);
        } else if (type === 'tag') {
            this.inputText.set(element.text);
            this.tagColor.set((element.style || 'blue') as TagColor);
        } else if (type === 'conjugation') {
            const conj = element as Conjugation;
            this.conjVerbs.set(conj.verbs.map((v) => ({
                name: v.name,
                rows: v.rows.map((r) => ({ ...r })),
            })));
            this.conjActiveVerb.set(0);
        } else if (type === 'quiz') {
            const quiz = element as Quiz;
            this.quizQuestions.set(quiz.questions.map((q) => ({ ...q })));
        } else if (type === 'image') {
            this.imageUrl.set(element.text);
            this.imageAlt.set(element.style);
            this.imageMode.set('url');
            this.imageFileName.set('');
        } else if (type === 'dragDrop') {
            const ex = element as DragDropExercise;
            this.dragDropWords.set([...ex.words]);
            this.dragDropRows.set(ex.rows.map((r) => ({ ...r })));
        } else if (type === 'pronunciationBlock') {
            const pb = element as PronunciationBlock;
            this.pronunciationItems.set(pb.items.map((i) => ({ ...i })));
        } else if (type === 'fillBlank') {
            const fb = element as FillBlankExercise;
            this.fillBlankRows.set(fb.rows.map((r) => ({ ...r, answers: [...r.answers] })));
        } else if (type === 'fillBlankTable') {
            const fbt = element as FillBlankTableExercise;
            const parsedRows = fbt.rows.map((r: FillBlankRow) => this.parseFillBlankTableRow(r, this.fillBlankTableCols()));
            const cols = parsedRows[0]?.cells.length ?? 3;
            const parsedStyle = this.parseFillBlankTableStyle(fbt.style, cols);
            this.fillBlankTableCols.set(cols);
            this.fillBlankTableHeaders.set(parsedStyle.headers);
            this.fillBlankTableRows.set(parsedRows.length ? parsedRows : this.createFillBlankTableRows(cols));
        } else {
            this.inputText.set(element.text);
        }        // restore grid state
        this.gridEnabled.set(!!element.gridId);
        this.activeGridId.set(element.gridId ?? null);
        this.activeGridCols.set((element.gridCols ?? 1) > 1 ? (element.gridCols ?? 2) : 2);

        setTimeout(() => {
            const container = this.doc.getElementById('main-content');
            if (container) {
                container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            }
        }, 0);
    }

    // ── List item management ──────────────────────────────────

    protected setListItem(index: number, value: string): void {
        this.listItems.update((items) => {
            const next = [...items];
            next[index] = value;
            return next;
        });
    }

    protected addListItem(): void {
        this.listItems.update((items) => [...items, '']);
        setTimeout(() => {
            const inputs = this.doc.querySelectorAll<HTMLInputElement>('.editor-list-input');
            inputs[inputs.length - 1]?.focus();
        }, 0);
    }

    protected removeListItem(index: number): void {
        this.listItems.update((items) => items.filter((_, i) => i !== index));
    }

    protected onListItemKeydown(event: KeyboardEvent, index: number): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.addListItem();
        } else if (event.key === 'Backspace' && this.listItems()[index] === '' && this.listItems().length > 1) {
            event.preventDefault();
            this.removeListItem(index);
        }
    }

    // ── Conjugation management ────────────────────────────────

    private defaultConjRows(): ConjugationRow[] {
        return [
            { pronoun: 'ich', verb: '', ending: '' },
            { pronoun: 'du', verb: '', ending: '' },
            { pronoun: 'er/sie/es', verb: '', ending: '' },
            { pronoun: 'wir', verb: '', ending: '' },
            { pronoun: 'ihr', verb: '', ending: '' },
            { pronoun: 'sie/Sie', verb: '', ending: '' },
        ];
    }

    protected setConjVerbName(verbIdx: number, name: string): void {
        this.conjVerbs.update((verbs) => {
            const next = verbs.map((v) => ({ ...v, rows: [...v.rows] }));
            next[verbIdx] = { ...next[verbIdx], name };
            return next;
        });
    }

    protected setConjCell(verbIdx: number, rowIdx: number, field: keyof ConjugationRow, value: string): void {
        this.conjVerbs.update((verbs) => {
            const next = verbs.map((v) => ({ ...v, rows: v.rows.map((r) => ({ ...r })) }));
            (next[verbIdx].rows[rowIdx] as Record<string, string>)[field] = value;
            return next;
        });
    }

    protected addConjVerb(): void {
        this.conjVerbs.update((verbs) => [
            ...verbs,
            { name: '', rows: this.defaultConjRows() },
        ]);
        this.conjActiveVerb.set(this.conjVerbs().length - 1);
    }

    protected removeConjVerb(verbIdx: number): void {
        if (this.conjVerbs().length <= 1) return;
        this.conjVerbs.update((verbs) => verbs.filter((_, i) => i !== verbIdx));
        const cur = this.conjActiveVerb();
        if (cur >= this.conjVerbs().length) this.conjActiveVerb.set(this.conjVerbs().length - 1);
    }

    // ── Quiz management ───────────────────────────────────

    protected setQuizField(idx: number, field: keyof QuizQuestion, value: string | number): void {
        this.quizQuestions.update((qs) => {
            const next = [...qs];
            next[idx] = { ...next[idx], [field]: value };
            return next;
        });
    }

    protected addQuizQuestion(): void {
        this.quizQuestions.update((qs) => [
            ...qs,
            { id: qs.length + 1, question: '', answer: '', hint: '' },
        ]);
    }

    protected removeQuizQuestion(idx: number): void {
        if (this.quizQuestions().length <= 1) return;
        this.quizQuestions.update((qs) => qs.filter((_, i) => i !== idx));
    }

    // ── Table management ──────────────────────────────────────

    protected setTableHeader(col: number, value: string): void {
        this.tableHeaders.update((headers) => {
            const next = [...headers];
            next[col] = value;
            return next;
        });
    }

    protected setTableCell(row: number, col: number, value: string): void {
        this.tableRows.update((rows) => {
            const next = rows.map((r) => [...r]);
            next[row][col] = value;
            return next;
        });
    }

    protected addTableColumn(): void {
        this.tableHeaders.update((h) => [...h, '']);
        this.tableRows.update((rows) => rows.map((r) => [...r, '']));
    }

    protected removeTableColumn(col: number): void {
        if (this.tableHeaders().length <= 1) return;
        this.tableHeaders.update((h) => h.filter((_, i) => i !== col));
        this.tableRows.update((rows) => rows.map((r) => r.filter((_, i) => i !== col)));
    }

    protected addTableRow(): void {
        const cols = this.tableHeaders().length;
        this.tableRows.update((rows) => [...rows, Array(cols).fill('')]);
    }

    protected removeTableRow(row: number): void {
        if (this.tableRows().length <= 1) return;
        this.tableRows.update((rows) => rows.filter((_, i) => i !== row));
    }

    // ── Drag-drop management ──────────────────────────────────

    protected setDragDropWord(index: number, value: string): void {
        this.dragDropWords.update((words) => {
            const next = [...words];
            next[index] = value;
            return next;
        });
    }

    protected addDragDropWord(): void {
        this.dragDropWords.update((words) => [...words, '']);
    }

    protected removeDragDropWord(index: number): void {
        this.dragDropWords.update((words) => words.filter((_, i) => i !== index));
    }

    protected setDragDropRowField(index: number, field: keyof DragDropRow, value: string): void {
        this.dragDropRows.update((rows) => {
            const next = [...rows];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    }

    protected addDragDropRow(): void {
        this.dragDropRows.update((rows) => [
            ...rows,
            { id: null, before: '', after: '', answer: '' },
        ]);
    }

    protected removeDragDropRow(index: number): void {
        if (this.dragDropRows().length <= 1) return;
        this.dragDropRows.update((rows) => rows.filter((_, i) => i !== index));
    }

    // ── Pronunciation management ──────────────────────────────

    protected setPronunciationField(index: number, field: keyof PronunciationItem, value: string): void {
        this.pronunciationItems.update((items) => {
            const next = [...items];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    }

    protected addPronunciationItem(): void {
        this.pronunciationItems.update((items) => [
            ...items,
            { id: items.length + 1, text: '', label: '' },
        ]);
    }

    protected removePronunciationItem(index: number): void {
        if (this.pronunciationItems().length <= 1) return;
        this.pronunciationItems.update((items) => items.filter((_, i) => i !== index));
    }

    // ── Fill-blank management ─────────────────────────────────

    /** Updates the sentence text for a row, recalculating answers array length to match blank count. */
    protected setFillBlankSentence(index: number, sentence: string): void {
        const blankCount = (sentence.match(/___/g) ?? []).length;
        this.fillBlankRows.update((rows) => {
            const next = [...rows];
            const current = next[index];
            const answers = Array.from({ length: blankCount }, (_, i) => current.answers[i] ?? '');
            next[index] = { ...current, sentence, answers };
            return next;
        });
    }

    protected setFillBlankAnswer(rowIndex: number, blankIndex: number, value: string): void {
        this.fillBlankRows.update((rows) => {
            const next = [...rows];
            const answers = [...next[rowIndex].answers];
            answers[blankIndex] = value;
            next[rowIndex] = { ...next[rowIndex], answers };
            return next;
        });
    }

    protected addFillBlankRow(): void {
        this.fillBlankRows.update((rows) => [
            ...rows,
            { id: rows.length + 1, sentence: '', answers: [''] },
        ]);
    }

    protected removeFillBlankRow(index: number): void {
        if (this.fillBlankRows().length <= 1) return;
        this.fillBlankRows.update((rows) => rows.filter((_, i) => i !== index));
    }

    protected fillBlankBlankCount(rowIndex: number): number[] {
        const count = (this.fillBlankRows()[rowIndex]?.sentence.match(/___/g) ?? []).length;
        return Array.from({ length: count }, (_, i) => i);
    }

    private createFillBlankTableCell(): FillBlankTableCellDraft {
        return { text: '', editable: false, answer: '' };
    }

    private createFillBlankTableRows(cols: number): FillBlankTableRowDraft[] {
        return [{
            id: 1,
            cells: Array.from({ length: cols }, () => this.createFillBlankTableCell()),
        }];
    }

    private parseFillBlankTableStyle(rawStyle: string, cols: number): FillBlankTableStoredStyle {
        try {
            const parsed = JSON.parse(rawStyle) as FillBlankTableStoredStyle;
            if (Array.isArray(parsed.headers) && parsed.headers.length > 0) {
                const headers = [...parsed.headers];
                if (headers.length < cols) {
                    headers.push(...Array.from({ length: cols - headers.length }, (_, i) => `Col ${headers.length + i + 1}`));
                } else if (headers.length > cols) {
                    headers.splice(cols);
                }
                return { headers };
            }
        } catch {
            // Default style
        }
        return { headers: Array.from({ length: cols }, (_, i) => `Col ${i + 1}`) };
    }

    private parseFillBlankTableRow(row: FillBlankRow, fallbackCols: number): FillBlankTableRowDraft {
        try {
            const parsed = JSON.parse(row.sentence) as FillBlankTableStoredRow;
            if (!Array.isArray(parsed.cells) || !parsed.cells.length) {
                throw new Error('invalid cells');
            }
            return {
                id: row.id,
                cells: parsed.cells.map((cell) => ({
                    text: cell.text ?? '',
                    editable: !!cell.editable,
                    answer: cell.answer ?? '',
                })),
            };
        } catch {
            const cells = Array.from({ length: Math.max(1, fallbackCols) }, () => this.createFillBlankTableCell());
            cells[0] = {
                text: row.sentence,
                editable: row.answers.length > 0,
                answer: row.answers[0] ?? '',
            };
            return { id: row.id, cells };
        }
    }

    protected fillBlankTableColIndexes(): number[] {
        return Array.from({ length: this.fillBlankTableCols() }, (_, i) => i);
    }

    protected setFillBlankTableColCount(count: number): void {
        const nextCount = Math.max(1, Math.min(8, count));
        this.fillBlankTableCols.set(nextCount);
        this.fillBlankTableHeaders.update((headers) => {
            const next = [...headers];
            if (next.length < nextCount) {
                next.push(...Array.from({ length: nextCount - next.length }, (_, i) => `Col ${next.length + i + 1}`));
            } else if (next.length > nextCount) {
                next.splice(nextCount);
            }
            return next;
        });
        this.fillBlankTableRows.update((rows) =>
            rows.map((row) => {
                const cells = [...row.cells];
                if (cells.length < nextCount) {
                    cells.push(...Array.from({ length: nextCount - cells.length }, () => this.createFillBlankTableCell()));
                } else if (cells.length > nextCount) {
                    cells.splice(nextCount);
                }
                return { ...row, cells };
            })
        );
    }

    protected setFillBlankTableHeader(colIndex: number, value: string): void {
        this.fillBlankTableHeaders.update((headers) => {
            const next = [...headers];
            next[colIndex] = value;
            return next;
        });
    }

    protected setFillBlankTableCellText(rowIndex: number, colIndex: number, value: string): void {
        this.fillBlankTableRows.update((rows) => {
            const next = rows.map((row) => ({ ...row, cells: row.cells.map((cell) => ({ ...cell })) }));
            next[rowIndex].cells[colIndex].text = value;
            return next;
        });
    }

    protected setFillBlankTableCellEditable(rowIndex: number, colIndex: number, editable: boolean): void {
        this.fillBlankTableRows.update((rows) => {
            const next = rows.map((row) => ({ ...row, cells: row.cells.map((cell) => ({ ...cell })) }));
            next[rowIndex].cells[colIndex].editable = editable;
            return next;
        });
    }

    protected setFillBlankTableCellAnswer(rowIndex: number, colIndex: number, value: string): void {
        this.fillBlankTableRows.update((rows) => {
            const next = rows.map((row) => ({ ...row, cells: row.cells.map((cell) => ({ ...cell })) }));
            next[rowIndex].cells[colIndex].answer = value;
            return next;
        });
    }

    protected addFillBlankTableRow(): void {
        this.fillBlankTableRows.update((rows) => [
            ...rows,
            {
                id: rows.length + 1,
                cells: Array.from({ length: this.fillBlankTableCols() }, () => this.createFillBlankTableCell()),
            },
        ]);
    }

    protected removeFillBlankTableRow(index: number): void {
        if (this.fillBlankTableRows().length <= 1) return;
        this.fillBlankTableRows.update((rows) => rows.filter((_, i) => i !== index));
    }

    // ── Grid helpers ──────────────────────────────────────────

    /** Selecciona columnas para un nuevo grid (limpia cualquier grid existente seleccionado). */
    protected setNewGrid(cols: number): void {
        this.activeGridCols.set(cols);
        this.activeGridId.set(null);
    }

    /** Elige unirse a un grid existente con el id y número de columnas dados. */
    protected joinGrid(id: string, cols: number): void {
        this.activeGridId.set(id);
        this.activeGridCols.set(cols);
    }

    // ── Image file upload ─────────────────────────────────────

    protected onImageFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        this.imageFileName.set(file.name);
        this.imageUploading.set(true);
        this.curriculumService.uploadImage(file).subscribe({
            next: (result) => {
                this.imageUrl.set(`${environment.apiUrl}/${result.path}`);
                this.imageUploading.set(false);
            },
            error: () => {
                this.imageFileName.set('');
                this.imageUploading.set(false);
            },
        });
    }

    // ── Submit — builds a local draft, no API call ────────────

    protected submit(event: Event): void {
        event.preventDefault();
        const type = this.activeType();
        if (!type) return;

        console.log("Llega aqui");
        console.log(type);

        let draft: ElementTypeObj;

        if (type === 'unorderedList') {
            const items = this.listItems().map((t) => t.trim()).filter(Boolean);
            if (!items.length) return;
            const lis = items.map((text, i): ListItem => ({
                id: -(i + 1),
                text,
                style: '',
                type: 'listItem',
                order: i,
                lesson: null!,
                baseStyle: 'li',
                ul: null!,
                delete: false,
            }));
            console.log(lis);
            const ul = new UnorderedList({
                id: -Date.now(),
                text: '',
                style: '',
                type: 'unorderedList',
                order: 0,
                lesson: null!,
                baseStyle: 'ul',
                delete: false,
                list: lis,
            });
            draft = ul;
            console.log(draft);
        } else if (type === 'table') {
            const headers = this.tableHeaders().map((h) => h.trim());
            const rows: TableRow[] = this.tableRows().map((cells, i) => ({
                id: -(i + 1),
                cells: cells.map((c) => c.trim()),
            }));
            if (headers.every((h) => !h)) return;
            draft = new Table({
                id: -Date.now(),
                text: '',
                style: '',
                type: 'table',
                order: 0,
                lesson: null!,
                baseStyle: 'table',
                headers,
                rows,
                delete: false,
            });
        } else if (type === 'tip') {
            const text = this.inputText().trim();
            if (!text) return;
            draft = new Tip({
                id: -Date.now(),
                text,
                style: this.tipColor(),
                type: 'tip',
                order: 0,
                lesson: null!,
                tipTitle: this.tipTitle().trim(),
                delete: false,
            });
        } else if (type === 'conjugation') {
            const verbs = this.conjVerbs().filter((v) => v.name.trim());
            if (!verbs.length) return;
            draft = new Conjugation({
                id: -Date.now(),
                text: '',
                style: '',
                type: 'conjugation',
                order: 0,
                lesson: null!,
                delete: false,
                verbs,
            });
        } else if (type === 'quiz') {
            const questions = this.quizQuestions().filter((q) => q.question.trim() && q.answer.trim());
            if (!questions.length) return;
            draft = new Quiz({
                id: -Date.now(),
                text: '',
                style: '',
                type: 'quiz',
                order: 0,
                lesson: null!,
                delete: false,
                questions,
            });
        } else if (type === 'image') {
            const url = this.imageUrl().trim();
            if (!url) return;
            draft = new ImageBlock({
                id: -Date.now(),
                text: url,
                style: this.imageAlt().trim(),
                type: 'image',
                order: 0,
                lesson: null!,
                delete: false,
            });
        } else if (type === 'dragDrop') {
            const words = this.dragDropWords().map((w) => w.trim()).filter(Boolean);
            const rows = this.dragDropRows()
                .filter((r) => r.answer.trim())
                .map((r) => ({
                    id: r.id,
                    before: r.before.trim(),
                    after: r.after.trim(),
                    answer: r.answer.trim(),
                }));
            if (!words.length || !rows.length) return;
            draft = new DragDropExercise({
                id: -Date.now(),
                text: '',
                style: '',
                type: 'dragDrop',
                order: 0,
                lesson: null!,
                delete: false,
                words,
                rows,
            });
        } else if (type === 'alphabetBlock') {
            draft = new AlphabetBlock({
                id: -Date.now(),
                text: '',
                style: '',
                type: 'alphabetBlock',
                order: 0,
                lesson: null!,
                delete: false,
            });
        } else if (type === 'pronunciationBlock') {
            const items = this.pronunciationItems()
                .filter((i) => i.text.trim())
                .map((i, idx) => ({ id: idx + 1, text: i.text.trim(), label: i.label.trim() }));
            if (!items.length) return;
            draft = new PronunciationBlock({
                id: -Date.now(),
                text: '',
                style: '',
                type: 'pronunciationBlock',
                order: 0,
                lesson: null!,
                delete: false,
                items,
            });
        } else if (type === 'fillBlank') {
            const rows = this.fillBlankRows()
                .filter((r) => r.sentence.trim() && r.answers.every((a) => a.trim()))
                .map((r, i) => ({
                    id: i + 1,
                    sentence: r.sentence.trim(),
                    answers: r.answers.map((a) => a.trim()),
                }));
            if (!rows.length) return;
            draft = new FillBlankExercise({
                id: -Date.now(),
                text: '',
                style: '',
                type: 'fillBlank',
                order: 0,
                lesson: null!,
                delete: false,
                rows,
            });
        } else if (type === 'fillBlankTable') {
            const rows = this.fillBlankTableRows()
                .filter((r) => r.cells.some((c) => c.text.trim() || c.answer.trim()))
                .map((r, i) => ({
                    id: i + 1,
                    sentence: JSON.stringify({
                        cells: r.cells.map((c) => ({
                            text: c.text.trim(),
                            editable: c.editable,
                            answer: c.answer.trim(),
                        })),
                    } as FillBlankTableStoredRow),
                    answers: r.cells.filter((c) => c.editable).map((c) => c.answer.trim()),
                }));
            if (!rows.length || rows.some((r) => r.answers.some((a) => !a))) return;
            draft = new FillBlankTableExercise({
                id: -Date.now(),
                text: '',
                style: JSON.stringify({
                    headers: this.fillBlankTableHeaders().map((h) => h.trim() || ''),
                } as FillBlankTableStoredStyle),
                type: 'fillBlankTable',
                order: 0,
                lesson: null!,
                delete: false,
                rows,
            });
        } else {
            const text = this.inputText().trim();
            if (!text) return;
            switch (type) {
                case 'title':
                    draft = new Title({
                        id: -Date.now(),
                        text,
                        style: '',
                        type,
                        order: 0,
                        lesson: null!,
                        baseStyle: '',
                        delete: false,
                    });
                    break;
                case 'subtitle':
                    draft = new Subtitle({
                        id: -Date.now(),
                        text,
                        style: '',
                        type,
                        order: 0,
                        lesson: null!,
                        baseStyle: '',
                        delete: false,
                    });
                    break;
                case 'element':
                    draft = new Element({
                        id: -Date.now(),
                        text,
                        style: '',
                        type,
                        order: 0,
                        lesson: null!,
                        delete: false,
                    });
                    break;
                case 'tag': {
                    const wordCount = text.split(/\s+/).filter(Boolean).length;
                    if (wordCount > 3) return;
                    draft = new Tag({
                        id: -Date.now(),
                        text,
                        style: this.tagColor(),
                        type,
                        order: 0,
                        lesson: null!,
                        delete: false,
                    });
                    break;
                }
            }


        }

        const idx = this.editingIndex();
        // Apply grid settings to the draft element
        if (this.gridEnabled()) {
            const gId = this.activeGridId() ?? `grid_${Date.now()}`;
            draft!.gridId = gId;
            draft!.gridCols = this.activeGridCols();
        } else {
            draft!.gridId = null;
            draft!.gridCols = 1;
        }
        if (idx !== null) {
            this.elementEdited.emit({ index: idx, element: draft });
        } else {
            this.elementAdded.emit(draft);
        }
        this.closePicker();
    }
}
