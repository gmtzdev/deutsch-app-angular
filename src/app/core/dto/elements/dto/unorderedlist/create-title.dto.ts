import { ListItem } from "../../../../models/elements/listitem.model";
import { CreateElementDto } from "../create-element.dto";


export interface CreateUnorderedListDto extends CreateElementDto {
    baseStyle: string;
    list: ListItem[];
}