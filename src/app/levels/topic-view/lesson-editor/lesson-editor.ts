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

type BlockType = 'title' | 'subtitle' | 'element' | 'unorderedList' | 'table' | 'tip';
type TipColor = 'info' | 'warning' | 'success' | 'danger';

interface TipColorOption {
    value: TipColor;
    label: string;
    bg: string;
    border: string;
}

interface BlockOption {
    type: BlockType;
    label: string;
    icon: string;
    description: string;
}

const BLOCK_OPTIONS: BlockOption[] = [
    { type: 'title', label: 'Título', icon: 'H1', description: 'Encabezado principal de sección' },
    { type: 'subtitle', label: 'Subtítulo', icon: 'H2', description: 'Encabezado secundario' },
    { type: 'element', label: 'Párrafo', icon: '¶', description: 'Texto de contenido' },
    { type: 'unorderedList', label: 'Lista', icon: '≡', description: 'Lista de ítems' },
    { type: 'table', label: 'Tabla', icon: '⊞', description: 'Tabla con filas y columnas' },
    { type: 'tip', label: 'Consejo', icon: '💡', description: 'Bloque de consejo o nota' },
];

const TIP_COLOR_OPTIONS: TipColorOption[] = [
    { value: 'info', label: 'Información', bg: 'rgba(74, 144, 217, 0.15)', border: '#4a90d9' },
    { value: 'warning', label: 'Advertencia', bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b' },
    { value: 'success', label: 'Correcto', bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e' },
    { value: 'danger', label: 'Importante', bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444' },
];

@Component({
    selector: 'app-lesson-editor',
    templateUrl: './lesson-editor.html',
    styleUrl: './lesson-editor.scss',
    imports: [LessonTitle, LessonSubtitle, LessonParagraph, LessonUnorderedList, LessonTable, LessonTip],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonEditor {
    readonly pendingElements = input<ElementTypeObj[]>([]);
    readonly elementAdded = output<ElementTypeObj>();
    readonly elementEdited = output<{ index: number; element: ElementTypeObj }>();
    readonly elementRemoved = output<number>();

    protected readonly hasPending = computed(() => this.pendingElements().length > 0);
    protected readonly editingIndex = signal<number | null>(null);

    private readonly doc = inject(DOCUMENT);

    protected readonly blockOptions = BLOCK_OPTIONS;

    protected readonly pickerOpen = signal(false);
    protected readonly activeType = signal<BlockType | null>(null);
    protected readonly inputText = signal('');
    protected readonly listItems = signal<string[]>(['']);
    protected readonly tableHeaders = signal<string[]>(['', '']);
    protected readonly tableRows = signal<string[][]>([['', '']]);
    protected readonly tipTitle = signal('');
    protected readonly tipColor = signal<TipColor>('info');

    protected readonly tipColorOptions = TIP_COLOR_OPTIONS;

    protected openPicker(): void {
        this.pickerOpen.set(true);
        this.activeType.set(null);
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
        } else {
            this.inputText.set(element.text);
        }
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

    // ── Submit — builds a local draft, no API call ────────────

    protected submit(event: Event): void {
        event.preventDefault();
        const type = this.activeType();
        if (!type) return;

        let draft: ElementTypeObj;

        if (type === 'unorderedList') {
            const items = this.listItems().map((t) => t.trim()).filter(Boolean);
            if (!items.length) return;
            const ul = new UnorderedList({
                id: -Date.now(),
                text: '',
                style: '',
                type: 'unorderedList',
                lesson: null!,
                baseStyle: 'ul',
                list: items.map((text, i): ListItem => ({
                    id: -(i + 1),
                    text,
                    style: '',
                    type: 'listItem',
                    lesson: null!,
                    baseStyle: 'li',
                    ul: null!,
                })),
            });
            draft = ul;
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
                lesson: null!,
                baseStyle: 'table',
                headers,
                rows,
            });
        } else if (type === 'tip') {
            const text = this.inputText().trim();
            if (!text) return;
            draft = new Tip({
                id: -Date.now(),
                text,
                style: this.tipColor(),
                type: 'tip',
                lesson: null!,
                tipTitle: this.tipTitle().trim(),
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
                        lesson: null!,
                        baseStyle: '',
                    });
                    break;
                case 'subtitle':
                    draft = new Subtitle({
                        id: -Date.now(),
                        text,
                        style: '',
                        type,
                        lesson: null!,
                        baseStyle: '',
                    });
                    break;
                case 'element':
                    draft = new Element({
                        id: -Date.now(),
                        text,
                        style: '',
                        type,
                        lesson: null!,
                    });
                    break;
            }

            const idx = this.editingIndex();
            if (idx !== null) {
                this.elementEdited.emit({ index: idx, element: draft });
            } else {
                this.elementAdded.emit(draft);
            }
            this.closePicker();
        }
    }
}
