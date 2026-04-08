import { CreateElementDto } from "../create-element.dto";

export interface CreateSubtitleDto extends CreateElementDto {
    baseStyle: string;
}