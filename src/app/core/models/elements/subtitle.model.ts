import { Element } from "./element.model";


export class Subtitle extends Element {
    baseStyle: string;

    constructor(element: Subtitle) {
        super(element);
        this.baseStyle = 'subtitle';
    }
}