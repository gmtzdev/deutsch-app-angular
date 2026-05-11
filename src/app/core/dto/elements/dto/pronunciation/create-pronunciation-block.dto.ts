import { CreateElementDto } from '../create-element.dto';
import { CreatePronunciationItemDto } from './create-pronunciation-item.dto';

export interface CreatePronunciationBlockDto extends CreateElementDto {
    items: CreatePronunciationItemDto[];
}
