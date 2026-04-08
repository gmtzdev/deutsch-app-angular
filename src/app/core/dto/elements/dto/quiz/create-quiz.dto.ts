import { CreateElementDto } from '../create-element.dto';
import { CreateQuizQuestionDto } from './create-quiz-question.dto';

export interface CreateQuizDto extends CreateElementDto {
    questions: CreateQuizQuestionDto[];
}
