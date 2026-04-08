import { CreateElementDto } from '../create-element.dto';
import { CreateVerbDataDto } from './create-verb-data.dto';

export interface CreateConjugationDto extends CreateElementDto {
    verbs: CreateVerbDataDto[];
}
