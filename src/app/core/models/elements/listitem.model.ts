import { Element } from "./element.model";
import { UnorderedList } from "./unorderedlist.model";

export class ListItem extends Element {
    baseStyle: string;
    ul: UnorderedList;

    constructor(element: ListItem) {
        super(element);
        this.baseStyle = 'li';
        this.ul = element.ul;
    }

}