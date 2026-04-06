import { CreateElementDto } from "../create-element.dto";

export interface CreateTitleDto extends CreateElementDto {
    baseStyle: string;
}