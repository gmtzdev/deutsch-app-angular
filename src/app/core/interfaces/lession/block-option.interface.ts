type BlockType = 'title' | 'subtitle' | 'element' | 'separator' | 'unorderedList' | 'table' | 'tip' | 'tag' | 'conjugation' | 'quiz' | 'image' | 'dragDrop' | 'alphabetBlock' | 'pronunciationBlock' | 'fillBlank' | 'fillBlankTable' | 'textQuestion' | 'multipleChoice';
interface BlockOption {
    type: BlockType;
    label: string;
    icon: string;
    description: string;
}