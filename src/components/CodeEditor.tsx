import React from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Box, 
  Alert, 
  AlertTitle,
  Divider
} from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import styled from 'styled-components';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeIcon from '@mui/icons-material/Code';

const EditorContainer = styled.div`
  .cm-editor {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-family: 'JetBrains Mono', 'Fira Code', Menlo, monospace;
    height: 200px;
    overflow: auto;
  }
`;

interface CodeEditorProps {
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  onExecute: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, onExecute }) => {
  const sampleCode = `// Example code - try running this with your tables
highlight in table 'users' row 1;
highlight in table 'users' column 'name';
highlight in table 'users' column 'email' row 2;`;

  return (
    <Paper sx={{ mb: 3, overflow: 'hidden' }}>
      <Box sx={{ 
        p: 2, 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText' 
      }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <CodeIcon sx={{ mr: 1 }} />
          SQL Visualization Code
        </Typography>
      </Box>
      
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Write your animation code using the custom syntax below.
          Each command creates one frame in the animation.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Custom Syntax Guide</AlertTitle>
          <Box component="ul" sx={{ pl: 2, mb: 1 }}>
            <li><Typography component="code" sx={{ fontFamily: 'monospace' }}>highlight in table 'tablename' row 1,2,3;</Typography> - Highlight specific rows</li>
            <li><Typography component="code" sx={{ fontFamily: 'monospace' }}>highlight in table 'tablename' column 'columnname';</Typography> - Highlight a column</li>
            <li><Typography component="code" sx={{ fontFamily: 'monospace' }}>highlight in table 'tablename' column 'columnname' row 1;</Typography> - Highlight a specific cell</li>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2">
            Make sure to use quotes around table and column names, and separate each command with a semicolon (;).
          </Typography>
        </Alert>
        
        <EditorContainer>
          <CodeMirror
            value={code}
            height="200px"
            extensions={[javascript({ jsx: true })]}
            onChange={(value) => setCode(value)}
            theme="light"
            placeholder={sampleCode}
          />
        </EditorContainer>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => setCode(sampleCode)}
            disabled={code.trim() !== ''}
          >
            Insert Sample Code
          </Button>
          <Button 
            variant="contained" 
            startIcon={<PlayArrowIcon />}
            onClick={onExecute}
            disabled={code.trim() === ''}
            color="primary"
          >
            Execute and Generate Animation
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default CodeEditor; 