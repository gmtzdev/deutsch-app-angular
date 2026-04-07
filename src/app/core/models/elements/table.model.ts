import { Element } from './element.model';
import { TableRow } from './table-row.model';

export class Table extends Element {
    baseStyle: string;
    headers: string[];
    rows: TableRow[];

    constructor(table: Table) {
        super(table);
        this.baseStyle = 'table';
        this.headers = table.headers ?? [];
        this.rows = table.rows ?? [];
    }
}
