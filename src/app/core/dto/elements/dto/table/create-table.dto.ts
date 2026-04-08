import { CreateElementDto } from '../create-element.dto';
import { CreateTableRowDto } from './create-tablerow.dto';

export interface CreateTableDto extends CreateElementDto {
    baseStyle?: string;
    headers: string[];
    rows: CreateTableRowDto[];
}
