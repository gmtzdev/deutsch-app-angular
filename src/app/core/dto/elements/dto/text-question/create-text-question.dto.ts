import { CreateElementDto } from '../create-element.dto';
import { CreateTextQuestionItemDto } from './create-text-question-item.dto';

export interface CreateTextQuestionDto extends CreateElementDto {
    questions: CreateTextQuestionItemDto[];
}
