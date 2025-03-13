import { Table, Action } from '../types';
import gifshot from 'gifshot';
import html2canvas from 'html2canvas';

interface AnimationFrame {
  tableId: string;
  rowIds?: string[];
  columnId?: string;
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
        ...actions.map(action => {
          if (action.type === 'highlight') {
            return {
              tableId: action.tableId,
              rowIds: action.rowIds,
              columnId: action.columnId
            };
          }
          return { tableId: '', rowIds: [], columnId: '' };
        })
      ];

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

      // Generate HTML for each frame and capture it as an image
      for (let i = 0; i < animationFrames.length; i++) {
        const frame = animationFrames[i];
        console.log(`Rendering frame ${i}:`, frame);
        
        // Create a visual representation of the tables with highlights
        container.innerHTML = renderTablesToHTML(tables, frame);
        
        // Wait for the DOM to render
        await new Promise(r => setTimeout(r, 100));
        
        // Use html2canvas to capture the rendered content
        try {
          const canvas = await html2canvas(container, {
            backgroundColor: '#ffffff',
            scale: 1,
            logging: true,
            useCORS: true,
            width: container.offsetWidth,
            height: container.scrollHeight,
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
      
      // Calculate the average dimensions from the frames
      const getImageDimensions = (src: string): Promise<{width: number, height: number}> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.src = src;
        });
      };
      
      // Use the first frame to set dimensions (avoids stretching)
      const firstImage = await getImageDimensions(frameImages[0]);
      const width = firstImage.width;
      const height = firstImage.height;
      
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
        progressCallback: (progress) => {
          console.log(`GIF generation progress: ${progress * 100}%`);
        }
      }, (obj) => {
        if (!obj.error) {
          console.log('GIF created successfully');
          resolve(obj.image);
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

// Helper function to render tables to HTML for capturing
const renderTablesToHTML = (tables: Table[], frame: AnimationFrame): string => {
  return `
    <div style="background: white; padding: 20px; font-family: Arial, sans-serif;">
      ${tables.map(table => `
        <div style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 10px;">${table.name}</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead>
              <tr>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">#</th>
                ${table.columns.map(column => {
                  const isColumnHighlighted = isColumnHeaderHighlighted(frame, table.id, column.id);
                  const headerStyle = isColumnHighlighted 
                    ? 'padding: 8px; border: 1px solid #ddd; background-color: #ffc107;' 
                    : 'padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;';
                  
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
                const isRowHighlighted = isHighlightedRow(frame, table.id, row.id);
                const rowStyle = isRowHighlighted 
                  ? 'background-color: #ffc107;' 
                  : rowIndex % 2 === 0 ? 'background-color: #f9f9f9;' : '';
                
                return `
                  <tr style="${rowStyle}">
                    <td style="padding: 8px; border: 1px solid #ddd;">${rowIndex + 1}</td>
                    ${table.columns.map(column => {
                      const isCellHighlighted = isHighlightedCell(frame, table.id, column.id, row.id);
                      const cellStyle = isCellHighlighted ? 'background-color: #ffc107;' : '';
                      
                      return `
                        <td style="padding: 8px; border: 1px solid #ddd; ${cellStyle}">
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
      `).join('')}
    </div>
  `;
};

// Helper function to check if a column header should be highlighted
const isColumnHeaderHighlighted = (frame: AnimationFrame, tableId: string, columnId: string): boolean => {
  if (frame.tableId !== tableId) return false;
  return frame.columnId === columnId && !frame.rowIds?.length;
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