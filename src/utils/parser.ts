import { Table, Action, HighlightAction, AddColumnAction, AddRowAction } from '../types';
import { v4 as uuidv4 } from 'uuid';

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
  
  // Parsing logic for add column command
  const addColumnMatch = line.match(/^add\s+in\s+table\s+['"](.+?)['"]\s+column\s+['"](.+?)['"](?:\s+cells\s+(.+))?$/i);
  
  if (addColumnMatch) {
    const tableName = addColumnMatch[1];
    const table = tables.find(t => t.name === tableName);
    
    if (!table) {
      console.error(`Table '${tableName}' not found`);
      return null;
    }
    
    const columnName = addColumnMatch[2];
    
    // Check if column already exists
    if (table.columns.some(col => col.name === columnName)) {
      console.error(`Column '${columnName}' already exists in table '${tableName}'`);
      return null;
    }
    
    const action: AddColumnAction = {
      type: 'addColumn',
      tableId: table.id,
      columnName
    };
    
    // If cell values are specified
    if (addColumnMatch[3]) {
      const cellsMatch = addColumnMatch[3].match(/\[\s*({.+}(?:\s*{.+})*)\s*\]/i);
      if (cellsMatch) {
        const cellsStr = cellsMatch[1];
        const cellMatches = [...cellsStr.matchAll(/{(\d+)-['"](.+?)['"]}/g)];
        
        if (cellMatches.length > 0) {
          action.cellValues = {};
          
          for (const match of cellMatches) {
            const rowIndex = parseInt(match[1]) - 1; // Convert to 0-indexed
            const value = match[2];
            
            if (rowIndex >= 0 && rowIndex < table.rows.length) {
              action.cellValues[rowIndex] = value;
            } else {
              console.warn(`Row index ${rowIndex + 1} is out of bounds for table '${tableName}'`);
            }
          }
        }
      }
    }
    
    return action;
  }
  
  // Parsing logic for add row command
  const addRowMatch = line.match(/^add\s+in\s+table\s+['"](.+?)['"]\s+row\s+\[\s*({.+}(?:\s*{.+})*)\s*\]$/i);
  
  if (addRowMatch) {
    const tableName = addRowMatch[1];
    const table = tables.find(t => t.name === tableName);
    
    if (!table) {
      console.error(`Table '${tableName}' not found`);
      return null;
    }
    
    if (table.columns.length === 0) {
      console.error(`Cannot add row to table '${tableName}' with no columns`);
      return null;
    }
    
    const cellsStr = addRowMatch[2];
    // Improved regex to properly capture all cell values without quotes
    const cellMatches = [...cellsStr.matchAll(/{([^{}]*)}/g)];
    
    const action: AddRowAction = {
      type: 'addRow',
      tableId: table.id,
      cellValues: []
    };
    
    // Extract cell values and trim whitespace
    for (const match of cellMatches) {
      action.cellValues.push(match[1].trim());
    }
    
    // Fill in missing values with empty strings
    while (action.cellValues.length < table.columns.length) {
      action.cellValues.push('');
    }
    
    return action;
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