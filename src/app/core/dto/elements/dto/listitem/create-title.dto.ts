import { CreateElementDto } from "../create-element.dto";

export interface CreateListItemDto extends CreateElementDto {
    baseStyle: string;
}