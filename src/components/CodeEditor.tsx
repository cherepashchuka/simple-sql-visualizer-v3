import React from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import styled from 'styled-components';

const EditorCard = styled(Card)`
  margin-bottom: 20px;
`;

const EditorContainer = styled.div`
  .cm-editor {
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    font-family: monospace;
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
    <EditorCard>
      <Card.Header>
        <h4>SQL Visualization Code</h4>
      </Card.Header>
      <Card.Body>
        <p>
          Write your animation code using the custom syntax below.
          Each command creates one frame in the animation.
        </p>
        <Alert variant="info">
          <Alert.Heading>Custom Syntax Guide</Alert.Heading>
          <ul className="mb-0">
            <li><code>highlight in table 'tablename' row 1,2,3;</code> - Highlight specific rows</li>
            <li><code>highlight in table 'tablename' column 'columnname';</code> - Highlight a column</li>
            <li><code>highlight in table 'tablename' column 'columnname' row 1;</code> - Highlight a specific cell</li>
          </ul>
          <hr />
          <p className="mb-0">
            Make sure to use quotes around table and column names, and separate each command with a semicolon (;).
          </p>
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
        
        <div className="d-flex justify-content-between mt-3">
          <Button 
            variant="outline-secondary" 
            onClick={() => setCode(sampleCode)}
            disabled={code.trim() !== ''}
          >
            Insert Sample Code
          </Button>
          <Button 
            variant="primary" 
            onClick={onExecute}
            disabled={code.trim() === ''}
          >
            Execute and Generate Animation
          </Button>
        </div>
      </Card.Body>
    </EditorCard>
  );
};

export default CodeEditor; 