import { Element } from "./element.model";

export class Title extends Element {
    baseStyle: string;

    constructor(element: Title) {
        super(element);
        this.baseStyle = 'title';
    }
}