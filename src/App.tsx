import { useEffect, useState } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  AlertTitle 
} from '@mui/material';
import TableEditor from './components/TableEditor';
import CodeEditor from './components/CodeEditor';
import AnimationDisplay from './components/AnimationDisplay';
import { Table, Action } from './types';
import { parseCode } from './utils/parser';
import { generateGif } from './utils/gifGenerator';
import { saveTables, loadTables } from './utils/storage';
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#0D47A1' }}>
        Simple SQL Visualizer
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TableEditor tables={tables} setTables={handleUpdateTables} />
        </Grid>
        
        <Grid item xs={12}>
          <CodeEditor 
            code={code} 
            setCode={setCode} 
            onExecute={() => handleExecute()} 
          />
          
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}
          
          {isGenerating && (
            <Paper sx={{ p: 5, textAlign: 'center', mt: 3 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Generating animation...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This might take a few moments, especially for complex tables
              </Typography>
            </Paper>
          )}
        </Grid>
        
        {actions.length > 0 && (
          <Grid item xs={12}>
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
          </Grid>
        )}
      </Grid>
      
      <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
        The project is Open Source and first version was done by <a href="https://github.com/cherepashchuka"><strong>Andrei Cherepashchuk</strong></a>
        </Typography>
      </Box>
    </Container>
  );
};

export default App;
