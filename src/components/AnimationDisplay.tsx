import React, { useState } from 'react';
import { 
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  TextField,
  Slider,
  styled,
  Card,
  CardContent
} from '@mui/material';
import { Table as TableType } from '../types';
import MovieIcon from '@mui/icons-material/Movie';
import SettingsIcon from '@mui/icons-material/Settings';
import DownloadIcon from '@mui/icons-material/Download';

const HeaderBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#0D47A1',
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const GifContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  textAlign: 'center',
  '& img': {
    maxWidth: '100%',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  }
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
  const [frameDelay, setFrameDelay] = useState(200); // Default: 200ms

  const handleRegenerateGif = () => {
    if (onGenerateGif) {
      onGenerateGif(frameDelay);
    }
  };

  const speedText = frameDelay < 200 ? 'Fast' : frameDelay < 500 ? 'Medium' : 'Slow';

  return (
    <Paper sx={{ mb: 3, overflow: 'hidden' }}>
      <HeaderBox>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <MovieIcon sx={{ mr: 1 }} />
          Animation Result
        </Typography>
      </HeaderBox>
      
      <Box sx={{ p: 3 }}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Animation Speed
            </Typography>
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
            
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              {speedText} - {frameDelay}ms ({(frameDelay / 1000).toFixed(1)}s)
            </Typography>
            
            {onGenerateGif && (
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={handleRegenerateGif}
                  startIcon={<SettingsIcon />}
                  fullWidth
                  sx={{ 
                    backgroundColor: '#0D47A1',
                    color: '#fff',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#0A3882'
                    }
                  }}
                >
                  Regenerate GIF with Current Settings
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
        
        {gifUrl && (
          <GifContainer>
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