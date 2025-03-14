import { Table, Action, AddColumnAction, AddRowAction } from '../types';
import gifshot from 'gifshot';
import html2canvas from 'html2canvas';
import { v4 as uuidv4 } from 'uuid';

interface AnimationFrame {
  tableId: string;
  rowIds?: string[];
  columnId?: string;
  action?: Action; // Store the original action for table modifications
}

interface GifOptions {
  frameDelay?: number;
}

export const generateGif = async (tables: Table[], actions: Action[], options?: GifOptions): Promise<string> => {
  const frameDelay = options?.frameDelay || 300; // Default 300ms if not specified
  
  return new Promise(async (resolve, reject) => {
    try {
      // Prepare animation frames, always add an initial frame with no highlights
      const animationFrames: AnimationFrame[] = [
        { tableId: '', rowIds: [], columnId: '' }, // Empty first frame with no highlights
      ];
      
      // Create a copy of tables that we'll modify as we go through the actions
      let currentTables = JSON.parse(JSON.stringify(tables)) as Table[];
      
      // Add frames for each action in the order they were specified
      for (const action of actions) {
        if (action.type === 'highlight') {
          animationFrames.push({
            tableId: action.tableId,
            rowIds: action.rowIds,
            columnId: action.columnId,
            action
          });
        } else if (action.type === 'addColumn' || action.type === 'addRow') {
          // For add actions, we'll apply the change to our current tables
          // and create a frame that shows the result
          if (action.type === 'addColumn') {
            currentTables = applyAddColumnAction(currentTables, action);
          } else if (action.type === 'addRow') {
            currentTables = applyAddRowAction(currentTables, action);
          }
          
          // Add a frame that shows the modified tables
          animationFrames.push({
            tableId: action.tableId, // Highlight the table that was modified
            action
          });
        }
      }

      console.log('Animation frames to render:', animationFrames);

      // Capture all frames
      const frameImages: string[] = [];
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '0';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.backgroundColor = '#fff';
      container.style.zIndex = '-1000';
      document.body.appendChild(container);

      // First, render all frames to determine the maximum dimensions
      let maxWidth = 0;
      let maxHeight = 0;
      
      // Generate HTML for each frame to determine max dimensions
      for (let i = 0; i < animationFrames.length; i++) {
        const frame = animationFrames[i];
        
        // For the first frame, use the original tables
        // For subsequent frames, use the progressively modified tables based on the frame index
        // This ensures we maintain the correct order of modifications
        let tablesToRender;
        if (i === 0) {
          tablesToRender = tables;
        } else {
          // Create a copy of the original tables
          tablesToRender = JSON.parse(JSON.stringify(tables)) as Table[];
          
          // Apply all modifications up to this frame
          for (let j = 0; j < i; j++) {
            const prevFrame = animationFrames[j + 1]; // +1 to skip the initial empty frame
            if (prevFrame?.action?.type === 'addColumn') {
              tablesToRender = applyAddColumnAction(tablesToRender, prevFrame.action as AddColumnAction);
            } else if (prevFrame?.action?.type === 'addRow') {
              tablesToRender = applyAddRowAction(tablesToRender, prevFrame.action as AddRowAction);
            }
          }
        }
        
        // Create a visual representation of the tables with highlights
        container.innerHTML = renderTablesToHTML(tablesToRender, frame);
        
        // Wait for the DOM to render
        await new Promise(r => setTimeout(r, 100));
        
        // Get dimensions
        maxWidth = Math.max(maxWidth, container.scrollWidth);
        maxHeight = Math.max(maxHeight, container.scrollHeight);
      }
      
      // Set fixed dimensions for the container based on the maximum dimensions found
      container.style.width = `${maxWidth}px`;
      container.style.height = `${maxHeight}px`;
      
      // Now capture all frames with consistent dimensions
      for (let i = 0; i < animationFrames.length; i++) {
        const frame = animationFrames[i];
        console.log(`Rendering frame ${i}:`, frame);
        
        // For the first frame, use the original tables
        // For subsequent frames, use the progressively modified tables based on the frame index
        let tablesToRender;
        if (i === 0) {
          tablesToRender = tables;
        } else {
          // Create a copy of the original tables
          tablesToRender = JSON.parse(JSON.stringify(tables)) as Table[];
          
          // Apply all modifications up to this frame
          for (let j = 0; j < i; j++) {
            const prevFrame = animationFrames[j + 1]; // +1 to skip the initial empty frame
            if (prevFrame?.action?.type === 'addColumn') {
              tablesToRender = applyAddColumnAction(tablesToRender, prevFrame.action as AddColumnAction);
            } else if (prevFrame?.action?.type === 'addRow') {
              tablesToRender = applyAddRowAction(tablesToRender, prevFrame.action as AddRowAction);
            }
          }
        }
        
        // Create a visual representation of the tables with highlights
        container.innerHTML = renderTablesToHTML(tablesToRender, frame);
        
        // Wait for the DOM to render
        await new Promise(r => setTimeout(r, 100));
        
        // Use html2canvas to capture the rendered content
        try {
          const canvas = await html2canvas(container, {
            backgroundColor: '#ffffff',
            scale: 1,
            logging: true,
            useCORS: true,
            width: maxWidth,
            height: maxHeight,
          });
          
          const dataUrl = canvas.toDataURL('image/png');
          frameImages.push(dataUrl);
          console.log(`Frame ${i} captured: ${canvas.width}x${canvas.height}`);
        } catch (error) {
          console.error('Failed to capture frame:', error);
        }
      }

      // Clean up
      document.body.removeChild(container);

      if (frameImages.length === 0) {
        reject(new Error('Failed to generate any frames'));
        return;
      }

      console.log(`Captured ${frameImages.length} frames for animation`);
      
      // Use fixed dimensions for all frames
      const width = maxWidth;
      const height = maxHeight;
      
      console.log(`Using dimensions: ${width}x${height}`);

      // Convert frameDelay from ms to deciseconds (0.1 seconds) used by gifshot
      // gifshot's frameDuration is in 1/10th of a second (deciseconds)
      // So 100ms = 1 decisecond, 1000ms = 10 deciseconds
      const frameDurationInDeciseconds = Math.max(1, Math.round(frameDelay / 100));
      console.log(`Frame delay: ${frameDelay}ms, converted to ${frameDurationInDeciseconds} deciseconds for GIF`);

      // Create GIF from the images
      gifshot.createGIF({
        images: frameImages,
        gifWidth: width,
        gifHeight: height,
        numWorkers: 2,
        interval: frameDurationInDeciseconds / 10, // Convert deciseconds to seconds
        progressCallback: (progress: number) => {
          console.log(`GIF generation progress: ${progress * 100}%`);
        }
      }, (obj: { error: boolean | string; image?: string }) => {
        if (!obj.error) {
          console.log('GIF created successfully');
          if (obj.image) {
            resolve(obj.image);
          } else {
            reject(new Error('GIF was created but no image was returned'));
          }
        } else {
          console.error('GIF creation error:', obj.error);
          reject(new Error(`GIF creation error: ${obj.error}`));
        }
      });
    } catch (error) {
      console.error('Error generating GIF:', error);
      reject(error);
    }
  });
};

// Helper function to apply add column action
const applyAddColumnAction = (currentTables: Table[], action: AddColumnAction): Table[] => {
  return currentTables.map(table => {
    if (table.id === action.tableId) {
      // Create new column
      const newColumn = {
        id: uuidv4(),
        name: action.columnName
      };
      
      // Update rows with new column cells
      const updatedRows = table.rows.map((row, index) => {
        const cellValue = action.cellValues?.[index] || '';
        return {
          ...row,
          cells: {
            ...row.cells,
            [newColumn.id]: cellValue
          }
        };
      });
      
      return {
        ...table,
        columns: [...table.columns, newColumn],
        rows: updatedRows
      };
    }
    return table;
  });
};

// Helper function to apply add row action
const applyAddRowAction = (currentTables: Table[], action: AddRowAction): Table[] => {
  return currentTables.map(table => {
    if (table.id === action.tableId) {
      // Create new row with cells for each column
      const newRow = {
        id: uuidv4(),
        cells: {} as { [columnId: string]: string }
      };
      
      // Assign values to cells based on column order
      table.columns.forEach((column, index) => {
        newRow.cells[column.id] = action.cellValues[index] || '';
      });
      
      return {
        ...table,
        rows: [...table.rows, newRow]
      };
    }
    return table;
  });
};

// Helper function to render tables to HTML for capturing
const renderTablesToHTML = (tables: Table[], frame: AnimationFrame): string => {
  // Highlight the newly added column or row if this frame is for an add action
  const highlightNewAddition = frame.action?.type === 'addColumn' || frame.action?.type === 'addRow';
  
  return `
    <div style="background: white; padding: 20px; font-family: 'IBM Plex Sans', Arial, sans-serif;">
      ${tables.map(table => {
        // Check if this table was modified in this frame
        const isTableModified = frame.tableId === table.id && highlightNewAddition;
        
        return `
          <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 10px; color: #0D47A1;">${table.name}</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #eee; table-layout: fixed; margin-bottom: 20px;">
              <thead>
                <tr>
                  ${table.columns.map((column, colIndex) => {
                    // Highlight the new column if this is an addColumn action
                    const isNewColumn = isTableModified && 
                                       frame.action?.type === 'addColumn' && 
                                       colIndex === table.columns.length - 1;
                    
                    const headerStyle = isNewColumn
                      ? 'padding: 5px 10px; border: 1px solid #eee; text-align: right; background-color: #E3F2FD; color: #0D47A1;'
                      : isColumnHeaderHighlighted(frame, table.id, column.id)
                        ? 'padding: 5px 10px; border: 1px solid #eee; text-align: right; background-color: #E3F2FD; color: #0D47A1;' 
                        : 'padding: 5px 10px; border: 1px solid #eee; text-align: right; background-color: #0D47A1; color: white;';
                    
                    return `
                      <th style="${headerStyle}">
                        ${column.name}
                      </th>
                    `;
                  }).join('')}
                </tr>
              </thead>
              <tbody>
                ${table.rows.map((row, rowIndex) => {
                  // Highlight the new row if this is an addRow action
                  const isNewRow = isTableModified && 
                                  frame.action?.type === 'addRow' && 
                                  rowIndex === table.rows.length - 1;
                  
                  const isRowHighlighted = isNewRow || isHighlightedRow(frame, table.id, row.id);
                  const rowStyle = isRowHighlighted 
                    ? 'background-color: #E3F2FD;' 
                    : rowIndex % 2 === 0 ? 'background-color: #fff;' : 'background-color: #f7f7f7;';
                  
                  return `
                    <tr style="${rowStyle}">
                      ${table.columns.map((column, colIndex) => {
                        // Highlight the cell if it's in a new column or row
                        const isNewCell = (isTableModified && frame.action?.type === 'addColumn' && colIndex === table.columns.length - 1) ||
                                         (isTableModified && frame.action?.type === 'addRow' && rowIndex === table.rows.length - 1);
                        
                        const isCellHighlighted = isNewCell || isHighlightedCell(frame, table.id, column.id, row.id);
                        const cellStyle = isCellHighlighted 
                          ? 'padding: 5px 10px; border: 1px solid #eee; text-align: right; background-color: #E3F2FD;' 
                          : 'padding: 5px 10px; border: 1px solid #eee; text-align: right;';
                        
                        return `
                          <td style="${cellStyle}">
                            ${row.cells[column.id] || ''}
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      }).join('')}
    </div>
  `;
};

// Helper function to check if a column header should be highlighted
const isColumnHeaderHighlighted = (frame: AnimationFrame, tableId: string, columnId: string): boolean => {
  // Always return false to prevent column headers from being highlighted
  return false;
};

// Helper function to check if a row is highlighted
const isHighlightedRow = (frame: AnimationFrame, tableId: string, rowId: string): boolean => {
  if (frame.tableId !== tableId) return false;
  return !!(frame.rowIds?.includes(rowId) && !frame.columnId);
};

// Helper function to check if a cell is highlighted
const isHighlightedCell = (frame: AnimationFrame, tableId: string, columnId: string, rowId: string): boolean => {
  if (frame.tableId !== tableId) return false;
  
  if (frame.columnId === columnId) {
    if (frame.rowIds?.length) {
      return frame.rowIds.includes(rowId);
    }
    return true; // Highlight the entire column
  }
  
  return false;
}; 