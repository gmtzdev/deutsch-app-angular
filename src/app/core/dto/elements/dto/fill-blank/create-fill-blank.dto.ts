import { CreateElementDto } from '../create-element.dto';
import { CreateFillBlankRowDto } from './create-fill-blank-row.dto';


export interface CreateFillBlankDto extends CreateElementDto {
    rows: CreateFillBlankRowDto[];
}

