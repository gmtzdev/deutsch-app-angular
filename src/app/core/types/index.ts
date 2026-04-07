import { CreateElementDto } from "../dto/elements/dto/create-element.dto";
import { CreateListItemDto } from "../dto/elements/dto/listitem/create-title.dto";
import { CreateSubtitleDto } from "../dto/elements/dto/subtitle/create-title.dto";
import { CreateTitleDto } from "../dto/elements/dto/title/create-title.dto";
import { CreateUnorderedListDto } from "../dto/elements/dto/unorderedlist/create-title.dto";
import { Element } from "../models/elements/element.model";
import { ListItem } from "../models/elements/listitem.model";
import { Subtitle } from "../models/elements/subtitle.model";
import { Title } from "../models/elements/title.model";
import { UnorderedList } from "../models/elements/unorderedlist.model";
import { Table } from "../models/elements/table.model";
import { Tip } from "../models/elements/tip.model";
import { Tag } from "../models/elements/tag.model";
import { Conjugation } from "../models/elements/conjugation.model";

export type LessonElementDto = CreateElementDto | CreateTitleDto | CreateSubtitleDto | CreateListItemDto | CreateUnorderedListDto;

export type ElementType = 'element' | 'title' | 'subtitle' | 'listItem' | 'unorderedList' | 'table' | 'tip' | 'tag' | 'conjugation';
export type ElementTypeObj = Element | Title | Subtitle | ListItem | UnorderedList | Table | Tip | Tag | Conjugation;

export const elementTypes: ElementType[] = ['element', 'title', 'subtitle', 'listItem', 'unorderedList', 'table', 'tip', 'tag', 'conjugation'];