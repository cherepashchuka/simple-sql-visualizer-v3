import { useEffect, useState } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  AlertTitle,
  Button,
  Tooltip,
  Snackbar,
  Badge
} from '@mui/material';
import TableEditor from './components/TableEditor';
import CodeEditor from './components/CodeEditor';
import AnimationDisplay from './components/AnimationDisplay';
import { Table, Action } from './types';
import { parseCode } from './utils/parser';
import { generateGif } from './utils/gifGenerator';
import { 
  saveTables, 
  loadTables, 
  saveCode, 
  loadCode, 
  clearStorage, 
  checkAutoReset, 
  updateLastActivity,
  getTimeUntilReset
} from './utils/storage';
import { v4 as uuidv4 } from 'uuid';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const App = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [code, setCode] = useState<string>('');
  const [actions, setActions] = useState<Action[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showAutoResetNotification, setShowAutoResetNotification] = useState<boolean>(false);
  const [timeUntilReset, setTimeUntilReset] = useState<number | null>(null);

  // Set up activity tracking and timer
  useEffect(() => {
    // Update activity on user interactions
    const handleUserActivity = () => {
      updateLastActivity();
      updateTimeUntilReset();
    };

    // Add event listeners for user activity
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    
    // Initial activity update
    updateLastActivity();
    updateTimeUntilReset();
    
    // Set up timer to update the remaining time display
    const timer = setInterval(() => {
      updateTimeUntilReset();
    }, 60000); // Update every minute
    
    return () => {
      // Clean up event listeners and timer
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      clearInterval(timer);
    };
  }, []);
  
  // Helper function to update the time until reset
  const updateTimeUntilReset = () => {
    const remainingTime = getTimeUntilReset();
    setTimeUntilReset(remainingTime);
  };

  // Load tables and code from localStorage on initial load
  useEffect(() => {
    // Check if data was auto-reset due to inactivity
    const wasAutoReset = checkAutoReset();
    if (wasAutoReset) {
      setShowAutoResetNotification(true);
    }
    
    const savedTables = loadTables();
    const savedCode = loadCode();
    
    setTables(savedTables);
    setCode(savedCode);
  }, []);

  // Save tables to localStorage when they change
  useEffect(() => {
    if (tables.length > 0) {
      setIsSaving(true);
      saveTables(tables);
      
      // Show saving indicator for a short time
      const timer = setTimeout(() => {
        setIsSaving(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [tables]);
  
  // Save code to localStorage when it changes
  useEffect(() => {
    if (code) {
      setIsSaving(true);
      saveCode(code);
      
      // Show saving indicator for a short time
      const timer = setTimeout(() => {
        setIsSaving(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [code]);

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

  // Reset application state
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all tables and code? This action cannot be undone.')) {
      clearStorage();
      setTables([]);
      setCode('');
      setActions([]);
      setGifUrl(null);
      setError(null);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 0, fontWeight: 'bold', color: '#0D47A1' }}>
          Simple SQL Visualizer
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isSaving && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Saving...
            </Typography>
          )}
          
          {timeUntilReset !== null && (
            <Tooltip title={`Auto-reset in ${timeUntilReset} minutes of inactivity`}>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">{timeUntilReset}m</Typography>
              </Box>
            </Tooltip>
          )}
          
          <Tooltip title="Reset all data">
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              size="small"
            >
              Reset
            </Button>
          </Tooltip>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TableEditor tables={tables} setTables={setTables} />
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
                ...actions.map(action => {
                  if (action.type === 'highlight') {
                    return {
                      tableId: action.tableId,
                      rowIds: action.rowIds,
                      columnId: action.columnId
                    };
                  }
                  // For add column and add row actions, don't highlight anything
                  return { tableId: '', rowIds: [], columnId: '' };
                })
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
      
      {/* Auto-reset notification */}
      <Snackbar
        open={showAutoResetNotification}
        autoHideDuration={6000}
        onClose={() => setShowAutoResetNotification(false)}
        message="Data has been reset due to 1 hour of inactivity"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default App;
