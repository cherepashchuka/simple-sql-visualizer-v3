import { Table, Action, HighlightAction } from '../types';

export const parseCode = (code: string, tables: Table[]): Action[] => {
  if (!code.trim()) return [];
  
  // Split code by semicolons to get individual actions
  const actions: Action[] = [];
  const lines = code.split(';').filter(line => line.trim());
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    const action = parseLine(trimmedLine, tables);
    if (action) {
      actions.push(action);
    }
  }
  
  return actions;
};

const parseLine = (line: string, tables: Table[]): Action | null => {
  // Parsing logic for highlight command
  const highlightMatch = line.match(/^highlight\s+in\s+table\s+['"](.+?)['"]\s+(.+)$/i);
  
  if (highlightMatch) {
    const tableName = highlightMatch[1];
    const table = tables.find(t => t.name === tableName);
    
    if (!table) {
      console.error(`Table '${tableName}' not found`);
      return null;
    }
    
    const action: HighlightAction = {
      type: 'highlight',
      tableId: table.id
    };
    
    const targetInfo = highlightMatch[2].trim();
    
    // Highlight specific rows
    const rowMatch = targetInfo.match(/^row\s+(\d+(?:\s*,\s*\d+)*)$/i);
    if (rowMatch) {
      const rowNumbers = rowMatch[1].split(',').map(num => parseInt(num.trim()) - 1); // Convert to 0-indexed
      action.rowIds = rowNumbers.map(rowIndex => {
        return table.rows[rowIndex]?.id;
      }).filter(Boolean);
      return action;
    }
    
    // Highlight a column
    const columnMatch = targetInfo.match(/^column\s+['"](.+?)['"](?:\s+row\s+(\d+))?$/i);
    if (columnMatch) {
      const columnName = columnMatch[1];
      const column = table.columns.find(col => col.name === columnName);
      
      if (!column) {
        console.error(`Column '${columnName}' not found in table '${tableName}'`);
        return null;
      }
      
      action.columnId = column.id;
      
      // If a specific row is also specified
      if (columnMatch[2]) {
        const rowIndex = parseInt(columnMatch[2]) - 1; // Convert to 0-indexed
        const rowId = table.rows[rowIndex]?.id;
        if (rowId) {
          action.rowIds = [rowId];
        }
      }
      
      return action;
    }
  }
  
  console.error(`Invalid command: ${line}`);
  return null;
};

export const getTableByName = (name: string, tables: Table[]): Table | undefined => {
  return tables.find(table => table.name === name);
};

export const getTableById = (id: string, tables: Table[]): Table | undefined => {
  return tables.find(table => table.id === id);
};

export const getColumnByName = (tableName: string, columnName: string, tables: Table[]): { column: Table['columns'][0], table: Table } | undefined => {
  const table = getTableByName(tableName, tables);
  if (!table) return undefined;
  
  const column = table.columns.find(col => col.name === columnName);
  if (!column) return undefined;
  
  return { column, table };
}; 