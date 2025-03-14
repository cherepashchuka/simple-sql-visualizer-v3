import React, { useEffect, useState } from 'react';
import { 
  Paper,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Slider,
  Grid,
  TextField,
  Stack,
  ButtonGroup,
  Chip,
  IconButton,
  styled,
  Card,
  CardContent,
  Divider,
  Alert
} from '@mui/material';
import { Table as TableType } from '../types';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import MovieIcon from '@mui/icons-material/Movie';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DownloadIcon from '@mui/icons-material/Download';

const HeaderBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const HighlightedCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.warning.light + ' !important',
  transition: 'background-color 0.3s ease',
}));

const HighlightedRow = styled(TableRow)(({ theme }) => ({
  '& > td': {
    backgroundColor: theme.palette.warning.light + ' !important',
    transition: 'background-color 0.3s ease',
  }
}));

const HighlightedHeader = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.warning.light + ' !important',
  transition: 'background-color 0.3s ease',
}));

const GifContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  textAlign: 'center',
  '& img': {
    maxWidth: '100%',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  }
}));

const AnimationControls = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

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
  const [frameDelay, setFrameDelay] = useState(200); // Default: 200ms

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

  const speedText = frameDelay < 200 ? 'Fast' : frameDelay < 500 ? 'Medium' : 'Slow';

  return (
    <Paper sx={{ mb: 3, overflow: 'hidden' }}>
      <HeaderBox>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <MovieIcon sx={{ mr: 1 }} />
          Animation Result
        </Typography>
        {showControls && animationFrames.length > 1 && (
          <Button 
            variant="outlined"
            size="small"
            startIcon={<VisibilityOffIcon />}
            onClick={() => setShowControls(false)}
            sx={{ bgcolor: 'background.paper' }}
          >
            Hide Controls
          </Button>
        )}
        {!showControls && animationFrames.length > 1 && (
          <Button 
            variant="outlined"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => setShowControls(true)}
            sx={{ bgcolor: 'background.paper' }}
          >
            Show Controls
          </Button>
        )}
      </HeaderBox>
      
      <Box sx={{ p: 2 }}>
        {showControls && animationFrames.length > 1 && (
          <AnimationControls>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Frame: {currentFrameIndex + 1}/{totalFrames}
                </Typography>
                <ButtonGroup size="small" sx={{ mb: 2 }}>
                  <Button onClick={handleReset}>
                    <FirstPageIcon />
                  </Button>
                  <Button onClick={handlePrev}>
                    <SkipPreviousIcon />
                  </Button>
                  {isPlaying ? (
                    <Button color="primary" onClick={handlePause}>
                      <PauseIcon />
                    </Button>
                  ) : (
                    <Button color="primary" onClick={handlePlay}>
                      <PlayArrowIcon />
                    </Button>
                  )}
                  <Button onClick={handleNext}>
                    <SkipNextIcon />
                  </Button>
                </ButtonGroup>
                
                <Box sx={{ mb: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={4}>
                      <Typography variant="body2">Frame Delay:</Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Slider
                        min={50}
                        max={1000}
                        step={50}
                        value={frameDelay}
                        onChange={(e, value) => setFrameDelay(value as number)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        type="number"
                        size="small"
                        inputProps={{
                          min: 50,
                          max: 1000,
                          step: 50
                        }}
                        value={frameDelay}
                        onChange={(e) => setFrameDelay(parseInt(e.target.value))}
                        sx={{ width: '100%' }}
                      />
                    </Grid>
                  </Grid>
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  {speedText} - {frameDelay}ms ({(frameDelay / 1000).toFixed(1)}s)
                </Typography>
                
                {onGenerateGif && (
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      color="success"
                      size="small" 
                      onClick={handleRegenerateGif}
                      startIcon={<SettingsIcon />}
                    >
                      Regenerate GIF with Current Settings
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </AnimationControls>
        )}
        
        <Stack spacing={3}>
          {tables.map(table => (
            <Box key={table.id}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {table.name}
              </Typography>
              {table.columns.length > 0 ? (
                <TableContainer sx={{ mb: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {table.columns.map(column => {
                          const isHeaderHighlighted = isColumnHeaderHighlighted(table.id, column.id);
                          
                          return isHeaderHighlighted ? (
                            <HighlightedHeader key={column.id}>
                              {column.name}
                            </HighlightedHeader>
                          ) : (
                            <TableCell key={column.id}>
                              {column.name}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {table.rows.map((row) => {
                        const rowIsHighlighted = isRowHighlighted(table.id, row.id);
                        
                        if (rowIsHighlighted) {
                          return (
                            <HighlightedRow key={row.id}>
                              {table.columns.map(column => (
                                <TableCell key={column.id}>
                                  {row.cells[column.id] || ''}
                                </TableCell>
                              ))}
                            </HighlightedRow>
                          );
                        }
                        
                        return (
                          <TableRow key={row.id}>
                            {table.columns.map(column => {
                              const cellIsHighlighted = isColumnHighlighted(table.id, column.id, row.id);
                              
                              if (cellIsHighlighted) {
                                return (
                                  <HighlightedCell key={column.id}>
                                    {row.cells[column.id] || ''}
                                  </HighlightedCell>
                                );
                              }
                              
                              return <TableCell key={column.id}>{row.cells[column.id] || ''}</TableCell>;
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No columns in this table
                </Alert>
              )}
            </Box>
          ))}
        </Stack>
        
        {gifUrl && (
          <GifContainer>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Generated Animation GIF
            </Typography>
            <img src={gifUrl} alt="Animation" />
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = gifUrl;
                  link.download = 'table-animation.gif';
                  link.click();
                }}
              >
                Download GIF
              </Button>
            </Box>
          </GifContainer>
        )}
      </Box>
    </Paper>
  );
};

export default AnimationDisplay; 