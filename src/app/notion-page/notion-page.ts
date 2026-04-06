import {
    Component,
    ChangeDetectionStrategy,
    signal,
    computed,
    inject,
    DOCUMENT,
} from '@angular/core';

export type BlockType =
    | 'text'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'bullet'
    | 'numbered'
    | 'todo'
    | 'quote'
    | 'divider';

export interface Block {
    id: string;
    type: BlockType;
    content: string;
    checked?: boolean;
}

interface SlashCommand {
    type: BlockType;
    icon: string;
    label: string;
    description: string;
}

const BLOCK_COMMANDS: SlashCommand[] = [
    { type: 'text', icon: '¶', label: 'Texto', description: 'Párrafo de texto simple' },
    { type: 'h1', icon: 'H1', label: 'Título 1', description: 'Encabezado grande' },
    { type: 'h2', icon: 'H2', label: 'Título 2', description: 'Encabezado mediano' },
    { type: 'h3', icon: 'H3', label: 'Título 3', description: 'Encabezado pequeño' },
    { type: 'bullet', icon: '•', label: 'Lista', description: 'Lista con viñetas' },
    { type: 'numbered', icon: '1.', label: 'Numerada', description: 'Lista enumerada' },
    { type: 'todo', icon: '☐', label: 'Tarea', description: 'Casilla de verificación' },
    { type: 'quote', icon: '"', label: 'Cita', description: 'Bloque de cita' },
    { type: 'divider', icon: '—', label: 'Divisor', description: 'Línea separadora' },
];

const GRADIENTS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fd7043 0%, #ff8a65 100%)',
    'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
];

const PAGE_ICONS = ['📄', '📝', '🎯', '💡', '🌟', '🔖', '📚', '🧠', '🗺️', '✍️', '🖊️', '📋'];

@Component({
    selector: 'app-notion-page',
    imports: [],
    templateUrl: './notion-page.html',
    styleUrl: './notion-page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotionPage {
    private readonly doc = inject(DOCUMENT);

    protected readonly GRADIENTS = GRADIENTS;
    protected readonly BLOCK_COMMANDS = BLOCK_COMMANDS;

    protected readonly pageTitle = signal('');
    protected readonly pageIcon = signal('📄');
    protected readonly showCover = signal(true);
    protected readonly coverIndex = signal(0);
    protected readonly blocks = signal<Block[]>([
        { id: this.genId(), type: 'text', content: '' },
    ]);
    protected readonly hoveredBlockId = signal<string | null>(null);
    protected readonly slashMenu = signal<{
        visible: boolean;
        blockId: string;
        filter: string;
        selectedIndex: number;
    }>({ visible: false, blockId: '', filter: '', selectedIndex: 0 });

    protected readonly currentGradient = computed(() => GRADIENTS[this.coverIndex()]);

    protected readonly filteredCommands = computed(() => {
        const { filter } = this.slashMenu();
        if (!filter) return BLOCK_COMMANDS;
        const q = filter.toLowerCase();
        return BLOCK_COMMANDS.filter(
            (c) =>
                c.label.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q),
        );
    });

    private genId(): string {
        return Math.random().toString(36).slice(2, 10);
    }

    private focusBlock(blockId: string): void {
        setTimeout(() => {
            const el = this.doc.getElementById(`block-${blockId}`);
            if (el instanceof HTMLTextAreaElement) {
                el.focus();
                el.setSelectionRange(el.value.length, el.value.length);
            }
        }, 0);
    }

    protected cycleCover(): void {
        this.coverIndex.update((n) => (n + 1) % GRADIENTS.length);
    }

    protected toggleCover(): void {
        this.showCover.update((v) => !v);
    }

    protected cycleIcon(): void {
        const idx = PAGE_ICONS.indexOf(this.pageIcon());
        this.pageIcon.set(PAGE_ICONS[(idx + 1) % PAGE_ICONS.length]);
    }

    protected onTitleInput(event: Event): void {
        this.pageTitle.set((event.target as HTMLTextAreaElement).value);
    }

    protected onTitleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            const first = this.blocks()[0];
            if (first) this.focusBlock(first.id);
        }
    }

    protected onBlockInput(blockId: string, event: Event): void {
        const content = (event.target as HTMLTextAreaElement).value;
        this.blocks.update((blocks) =>
            blocks.map((b) => (b.id === blockId ? { ...b, content } : b)),
        );

        const slashIdx = content.lastIndexOf('/');
        if (slashIdx !== -1) {
            const after = content.slice(slashIdx + 1);
            if (!after.includes(' ')) {
                this.slashMenu.set({ visible: true, blockId, filter: after, selectedIndex: 0 });
                return;
            }
        }
        if (this.slashMenu().blockId === blockId) {
            this.slashMenu.update((m) => ({ ...m, visible: false }));
        }
    }

    protected onBlockKeyDown(event: KeyboardEvent, block: Block, index: number): void {
        const menu = this.slashMenu();

        if (menu.visible) {
            const cmds = this.filteredCommands();
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                this.slashMenu.update((m) => ({
                    ...m,
                    selectedIndex: Math.min(m.selectedIndex + 1, cmds.length - 1),
                }));
                return;
            }
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                this.slashMenu.update((m) => ({
                    ...m,
                    selectedIndex: Math.max(m.selectedIndex - 1, 0),
                }));
                return;
            }
            if (event.key === 'Enter') {
                event.preventDefault();
                const cmd = cmds[menu.selectedIndex];
                if (cmd) this.applyCommand(cmd.type, block);
                return;
            }
            if (event.key === 'Escape') {
                this.slashMenu.update((m) => ({ ...m, visible: false }));
                return;
            }
        }

        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            const newId = this.genId();
            const continuedTypes: BlockType[] = ['bullet', 'numbered', 'todo'];
            const nextType: BlockType = continuedTypes.includes(block.type) ? block.type : 'text';
            this.blocks.update((b) => {
                const arr = [...b];
                arr.splice(index + 1, 0, { id: newId, type: nextType, content: '', checked: false });
                return arr;
            });
            this.focusBlock(newId);
            return;
        }

        if (event.key === 'Backspace' && block.content === '') {
            const blocks = this.blocks();
            if (blocks.length > 1) {
                event.preventDefault();
                const prevId = index > 0 ? blocks[index - 1].id : blocks[1].id;
                this.blocks.update((b) => b.filter((bl) => bl.id !== block.id));
                this.focusBlock(prevId);
            }
            return;
        }
    }

    protected applyCommand(type: BlockType, block: Block): void {
        const content = block.content;
        const slashIdx = content.lastIndexOf('/');
        const newContent = slashIdx >= 0 ? content.slice(0, slashIdx) : content;

        if (type === 'divider') {
            const newId = this.genId();
            this.blocks.update((blocks) =>
                blocks.flatMap((b) =>
                    b.id === block.id
                        ? [
                            { id: b.id, type: 'divider' as BlockType, content: '' },
                            { id: newId, type: 'text' as BlockType, content: '' },
                        ]
                        : [b],
                ),
            );
            this.focusBlock(newId);
        } else {
            this.blocks.update((blocks) =>
                blocks.map((b) => (b.id === block.id ? { ...b, type, content: newContent } : b)),
            );
            this.focusBlock(block.id);
        }
        this.slashMenu.update((m) => ({ ...m, visible: false }));
    }

    protected selectCommand(type: BlockType, block: Block, event: MouseEvent): void {
        event.preventDefault();
        this.applyCommand(type, block);
    }

    protected addBlockAfter(afterId: string): void {
        const newId = this.genId();
        const idx = this.blocks().findIndex((b) => b.id === afterId);
        this.blocks.update((b) => {
            const arr = [...b];
            arr.splice(idx + 1, 0, { id: newId, type: 'text', content: '' });
            return arr;
        });
        this.focusBlock(newId);
    }

    protected toggleTodo(blockId: string): void {
        this.blocks.update((blocks) =>
            blocks.map((b) => (b.id === blockId ? { ...b, checked: !b.checked } : b)),
        );
    }

    protected getNumberedIndex(blockId: string): number {
        const blocks = this.blocks();
        let count = 0;
        for (const b of blocks) {
            if (b.type === 'numbered') count++;
            if (b.id === blockId) return count;
        }
        return count;
    }

    protected onBlockBlur(): void {
        setTimeout(() => {
            this.slashMenu.update((m) => ({ ...m, visible: false }));
        }, 150);
    }

    protected getPlaceholder(type: BlockType): string {
        const map: Partial<Record<BlockType, string>> = {
            h1: 'Encabezado 1',
            h2: 'Encabezado 2',
            h3: 'Encabezado 3',
            quote: 'Escribe una cita…',
            bullet: 'Elemento de lista',
            numbered: 'Elemento numerado',
            todo: 'Tarea pendiente',
        };
        return map[type] ?? 'Escribe algo, o usa "/" para insertar bloques';
    }

    protected getAriaLabel(type: BlockType): string {
        const map: Partial<Record<BlockType, string>> = {
            h1: 'Encabezado nivel 1',
            h2: 'Encabezado nivel 2',
            h3: 'Encabezado nivel 3',
            quote: 'Bloque de cita',
            bullet: 'Elemento de lista',
            numbered: 'Elemento de lista numerada',
            todo: 'Tarea',
        };
        return map[type] ?? 'Bloque de texto';
    }

    protected onBottomClick(): void {
        const blocks = this.blocks();
        this.addBlockAfter(blocks[blocks.length - 1].id);
    }
}
