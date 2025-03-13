import React, { useEffect, useState } from 'react';
import { Card, Button, Table, ButtonGroup, Form, Row, Col } from 'react-bootstrap';
import styled from 'styled-components';
import { Table as TableType } from '../types';

const AnimationContainer = styled.div`
  margin-bottom: 20px;
`;

const StyledTable = styled(Table)`
  margin-bottom: 0;
`;

const HighlightedCell = styled.td`
  background-color: #ffc107 !important;
  transition: background-color 0.3s ease;
`;

const HighlightedRow = styled.tr`
  background-color: #ffc107 !important;
  transition: background-color 0.3s ease;
`;

const HighlightedHeader = styled.th`
  background-color: #ffc107 !important;
  transition: background-color 0.3s ease;
`;

const GifContainer = styled.div`
  margin-top: 20px;
  text-align: center;
  
  img {
    max-width: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
`;

const AnimationControls = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

interface AnimationDisplayProps {
  tables: TableType[];
  animationFrames: {
    tableId: string;
    rowIds?: string[];
    columnId?: string;
  }[];
  currentFrameIndex: number;
  gifUrl: string | null;
  onGenerateGif?: (frameDelay: number) => void;
}

const AnimationDisplay: React.FC<AnimationDisplayProps> = ({
  tables,
  animationFrames,
  currentFrameIndex: initialFrameIndex,
  gifUrl,
  onGenerateGif
}) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(initialFrameIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [frameDelay, setFrameDelay] = useState(200); // Default: 200ms (0.2 seconds)

  const currentFrame = animationFrames[currentFrameIndex] || null;
  const totalFrames = animationFrames.length;

  // Auto-play animation
  useEffect(() => {
    let interval: number | undefined;
    
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentFrameIndex(prev => {
          const next = (prev + 1) % totalFrames;
          if (next === 0 && prev === totalFrames - 1) {
            setIsPlaying(false); // Stop at the end
            return 0;
          }
          return next;
        });
      }, frameDelay); // Use the frameDelay for preview too
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, totalFrames, frameDelay]);

  const handlePlay = () => {
    if (currentFrameIndex === totalFrames - 1) {
      setCurrentFrameIndex(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(prev => (prev - 1 + totalFrames) % totalFrames);
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(prev => (prev + 1) % totalFrames);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  };

  const handleRegenerateGif = () => {
    if (onGenerateGif) {
      onGenerateGif(frameDelay);
    }
  };

  const isColumnHeaderHighlighted = (tableId: string, columnId: string) => {
    if (!currentFrame) return false;
    if (currentFrame.tableId !== tableId) return false;
    return currentFrame.columnId === columnId && !currentFrame.rowIds?.length;
  };

  const isRowHighlighted = (tableId: string, rowId: string) => {
    if (!currentFrame) return false;
    if (currentFrame.tableId !== tableId) return false;
    
    return currentFrame.rowIds?.includes(rowId) && !currentFrame.columnId;
  };

  const isColumnHighlighted = (tableId: string, columnId: string, rowId?: string) => {
    if (!currentFrame) return false;
    if (currentFrame.tableId !== tableId) return false;
    
    if (currentFrame.columnId === columnId) {
      if (rowId && currentFrame.rowIds?.length) {
        return currentFrame.rowIds.includes(rowId);
      }
      return true; // Highlight the entire column if no specific row
    }
    
    return false;
  };

  return (
    <AnimationContainer>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4>Animation Result</h4>
          {showControls && animationFrames.length > 1 && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowControls(false)}
            >
              Hide Controls
            </Button>
          )}
          {!showControls && animationFrames.length > 1 && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowControls(true)}
            >
              Show Controls
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          {showControls && animationFrames.length > 1 && (
            <AnimationControls>
              <Card style={{ width: '100%', maxWidth: '500px' }}>
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <span>Frame: {currentFrameIndex + 1}/{totalFrames}</span>
                  </div>
                  <ButtonGroup className="mb-3">
                    <Button variant="outline-secondary" onClick={handleReset}>⏮️</Button>
                    <Button variant="outline-secondary" onClick={handlePrev}>⏪</Button>
                    {isPlaying ? (
                      <Button variant="outline-primary" onClick={handlePause}>⏸️</Button>
                    ) : (
                      <Button variant="outline-primary" onClick={handlePlay}>▶️</Button>
                    )}
                    <Button variant="outline-secondary" onClick={handleNext}>⏩</Button>
                  </ButtonGroup>
                  
                  <Form.Group as={Row} className="mb-2 align-items-center">
                    <Form.Label column sm={4}>Frame Delay (ms):</Form.Label>
                    <Col sm={5}>
                      <Form.Range 
                        min={50} 
                        max={1000} 
                        step={50}
                        value={frameDelay}
                        onChange={(e) => setFrameDelay(parseInt(e.target.value))}
                      />
                    </Col>
                    <Col sm={3}>
                      <Form.Control 
                        type="number" 
                        size="sm"
                        min={50}
                        max={1000}
                        step={50}
                        value={frameDelay}
                        onChange={(e) => setFrameDelay(parseInt(e.target.value))}
                      />
                    </Col>
                  </Form.Group>
                  
                  <div>
                    <small className="text-muted">
                      {frameDelay < 200 ? 'Fast' : frameDelay < 500 ? 'Medium' : 'Slow'} - 
                      {frameDelay}ms ({(frameDelay / 1000).toFixed(1)}s)
                    </small>
                  </div>
                  
                  {onGenerateGif && (
                    <Button 
                      variant="outline-success" 
                      size="sm" 
                      onClick={handleRegenerateGif}
                      className="mt-2"
                    >
                      Regenerate GIF with Current Settings
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </AnimationControls>
          )}
          
          {tables.map(table => (
            <div key={table.id} className="mb-4">
              <h5>{table.name}</h5>
              {table.columns.length > 0 ? (
                <div className="table-responsive">
                  <StyledTable striped bordered>
                    <thead>
                      <tr>
                        <th>#</th>
                        {table.columns.map(column => {
                          const isHeaderHighlighted = isColumnHeaderHighlighted(table.id, column.id);
                          
                          return isHeaderHighlighted ? (
                            <HighlightedHeader key={column.id}>
                              {column.name}
                            </HighlightedHeader>
                          ) : (
                            <th key={column.id}>
                              {column.name}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rowIndex) => {
                        const rowIsHighlighted = isRowHighlighted(table.id, row.id);
                        
                        if (rowIsHighlighted) {
                          return (
                            <HighlightedRow key={row.id}>
                              <td>{rowIndex + 1}</td>
                              {table.columns.map(column => (
                                <td key={column.id}>{row.cells[column.id] || ''}</td>
                              ))}
                            </HighlightedRow>
                          );
                        }
                        
                        return (
                          <tr key={row.id}>
                            <td>{rowIndex + 1}</td>
                            {table.columns.map(column => {
                              const cellIsHighlighted = isColumnHighlighted(table.id, column.id, row.id);
                              
                              if (cellIsHighlighted) {
                                return (
                                  <HighlightedCell key={column.id}>
                                    {row.cells[column.id] || ''}
                                  </HighlightedCell>
                                );
                              }
                              
                              return <td key={column.id}>{row.cells[column.id] || ''}</td>;
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </StyledTable>
                </div>
              ) : (
                <div className="alert alert-info">No columns in this table</div>
              )}
            </div>
          ))}
          
          {gifUrl && (
            <GifContainer>
              <h5>Generated Animation GIF</h5>
              <img src={gifUrl} alt="Animation" />
              <div className="mt-2">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = gifUrl;
                    link.download = 'table-animation.gif';
                    link.click();
                  }}
                >
                  Download GIF
                </Button>
              </div>
            </GifContainer>
          )}
        </Card.Body>
      </Card>
    </AnimationContainer>
  );
};

export default AnimationDisplay; 