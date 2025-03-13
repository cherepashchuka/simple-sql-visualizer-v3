import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import TableEditor from './components/TableEditor';
import CodeEditor from './components/CodeEditor';
import AnimationDisplay from './components/AnimationDisplay';
import { Table, Action } from './types';
import { parseCode } from './utils/parser';
import { generateGif } from './utils/gifGenerator';
import { saveTables, loadTables } from './utils/storage';
import 'bootstrap/dist/css/bootstrap.min.css';
import { v4 as uuidv4 } from 'uuid';

const App = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [code, setCode] = useState<string>('');
  const [actions, setActions] = useState<Action[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Load tables from localStorage on initial load
  useEffect(() => {
    const savedTables = loadTables();
    setTables(savedTables);
  }, []);

  // Save tables to localStorage when they change
  useEffect(() => {
    saveTables(tables);
  }, [tables]);

  const handleExecute = async (frameDelay?: number) => {
    try {
      setError(null);
      setIsGenerating(true);
      setGenerationProgress(0);
      
      // Parse the code to get actions
      const parsedActions = parseCode(code, tables);
      setActions(parsedActions);
      
      if (parsedActions.length === 0) {
        setError('No valid actions found in code');
        setIsGenerating(false);
        return;
      }
      
      // Reset display
      setCurrentFrameIndex(0);
      setGifUrl(null);
      
      // Generate GIF with optional frame delay
      const gifDataUrl = await generateGif(tables, parsedActions, { frameDelay });
      setGifUrl(gifDataUrl);
    } catch (err) {
      console.error('Error executing code:', err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // Update tables with a wrapper to validate tables count
  const handleUpdateTables = (newTables: Table[]) => {
    if (newTables.length <= 3) {
      setTables(newTables);
    } else {
      alert('Maximum of 3 tables allowed');
    }
  };

  return (
    <Container fluid className="p-4">
      <h1 className="mb-4">SQL Visualizer</h1>
      
      <Row>
        <Col md={6} className="mb-4">
          <TableEditor tables={tables} setTables={handleUpdateTables} />
        </Col>
        
        <Col md={6}>
          <CodeEditor 
            code={code} 
            setCode={setCode} 
            onExecute={() => handleExecute()} 
          />
          
          {error && (
            <Card className="mb-4 bg-danger text-white">
              <Card.Body>
                <Card.Title>Error</Card.Title>
                <Card.Text>{error}</Card.Text>
              </Card.Body>
            </Card>
          )}
          
          {isGenerating ? (
            <Card>
              <Card.Body className="text-center p-5">
                <Spinner animation="border" role="status" variant="primary">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Generating animation...</p>
                <p className="text-muted small">This might take a few moments, especially for complex tables</p>
              </Card.Body>
            </Card>
          ) : actions.length > 0 && (
            <AnimationDisplay 
              tables={tables}
              animationFrames={[
                { tableId: '', rowIds: [], columnId: '' }, // Empty first frame
                ...actions.map(action => ({
                  tableId: action.type === 'highlight' ? action.tableId : '',
                  rowIds: action.type === 'highlight' ? action.rowIds : [],
                  columnId: action.type === 'highlight' ? action.columnId : ''
                }))
              ]}
              currentFrameIndex={currentFrameIndex}
              gifUrl={gifUrl}
              onGenerateGif={handleExecute}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default App;
