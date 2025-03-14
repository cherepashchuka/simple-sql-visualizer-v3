export interface Column {
  id: string;
  name: string;
}

export interface Row {
  id: string;
  cells: { [columnId: string]: string };
}

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  rows: Row[];
}

export interface HighlightAction {
  type: 'highlight';
  tableId: string;
  rowIds?: string[];
  columnId?: string;
}

export interface AddColumnAction {
  type: 'addColumn';
  tableId: string;
  columnName: string;
  cellValues?: { [rowIndex: number]: string };
}

export interface AddRowAction {
  type: 'addRow';
  tableId: string;
  cellValues: string[];
}

export type Action = HighlightAction | AddColumnAction | AddRowAction;

export interface AnimationFrame {
  tables: Table[];
  highlightedElements: {
    tableId: string;
    rowIds?: string[];
    columnId?: string;
  }[];
} 