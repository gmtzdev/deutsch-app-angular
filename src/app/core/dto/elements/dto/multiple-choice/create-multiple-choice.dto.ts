import { CreateElementDto } from '../create-element.dto';
import { CreateMultipleChoiceQuestionDto } from './create-multiple-choice-question.dto';

export interface CreateMultipleChoiceDto extends CreateElementDto {
    questions: CreateMultipleChoiceQuestionDto[];
}
