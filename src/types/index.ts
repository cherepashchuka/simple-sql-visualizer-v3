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

export type Action = HighlightAction;

export interface AnimationFrame {
  tables: Table[];
  highlightedElements: {
    tableId: string;
    rowIds?: string[];
    columnId?: string;
  }[];
} 