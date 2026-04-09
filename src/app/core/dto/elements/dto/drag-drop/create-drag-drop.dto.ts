import { CreateElementDto } from '../create-element.dto';
import { CreateDragDropRowDto } from './create-drag-drop-row.dto';

export interface CreateDragDropDto extends CreateElementDto {
    words: string[];
    rows: CreateDragDropRowDto[];
}
