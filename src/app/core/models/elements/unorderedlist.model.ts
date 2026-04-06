import { Element } from "./element.model";
import { ListItem } from "./listitem.model";


export class UnorderedList extends Element {
    baseStyle: string;
    list: ListItem[];


    constructor(element: UnorderedList) {
        super(element);
        this.baseStyle = 'ul';
        this.list = [];
    }
}