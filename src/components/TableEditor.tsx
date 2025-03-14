import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  Box, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Alert,
  Stack,
  Divider,
  styled
} from '@mui/material';
import { Table as TableType, Column, Row as RowType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import TableRowsIcon from '@mui/icons-material/TableRows';
import TableChartIcon from '@mui/icons-material/TableChart';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

// Styled components
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  position: 'relative',
  '&:hover .row-delete-button': {
    opacity: 1,
  },
}));

const TableNameInput = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.light,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  background: 'white',
  borderRadius: theme.shape.borderRadius,
  width: '60%',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#0D47A1',
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const RowDeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: -8,
  opacity: 0,
  transition: 'opacity 0.2s',
  color: theme.palette.error.main,
  padding: 4,
  '&:hover': {
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
  },
}));

interface TableEditorProps {
  tables: TableType[];
  setTables: React.Dispatch<React.SetStateAction<TableType[]>>;
}

const TableEditor: React.FC<TableEditorProps> = ({ tables, setTables }) => {
  const [newTableName, setNewTableName] = useState('');
  const [newColumnName, setNewColumnName] = useState<{ [tableId: string]: string }>({});

  const addTable = () => {
    if (newTableName.trim() === '') return;
    if (tables.length >= 3) {
      alert('Maximum of 3 tables allowed');
      return;
    }

    const newTable: TableType = {
      id: uuidv4(),
      name: newTableName,
      columns: [],
      rows: []
    };

    setTables([...tables, newTable]);
    setNewTableName('');
  };

  const removeTable = (tableId: string) => {
    setTables(tables.filter(table => table.id !== tableId));
  };

  const addColumn = (tableId: string) => {
    const columnName = newColumnName[tableId]?.trim();
    if (!columnName) return;

    setTables(
      tables.map(table => {
        if (table.id === tableId) {
          const newColumn: Column = {
            id: uuidv4(),
            name: columnName
          };
          
          // Add empty cell for this column to all existing rows
          const updatedRows = table.rows.map(row => ({
            ...row,
            cells: {
              ...row.cells,
              [newColumn.id]: ''
            }
          }));

          return {
            ...table,
            columns: [...table.columns, newColumn],
            rows: updatedRows
          };
        }
        return table;
      })
    );

    setNewColumnName({ ...newColumnName, [tableId]: '' });
  };

  const removeColumn = (tableId: string, columnId: string) => {
    setTables(
      tables.map(table => {
        if (table.id === tableId) {
          // Remove column
          const updatedColumns = table.columns.filter(col => col.id !== columnId);
          
          // Remove this column's cells from all rows
          const updatedRows = table.rows.map(row => {
            const newCells = { ...row.cells };
            delete newCells[columnId];
            return {
              ...row,
              cells: newCells
            };
          });

          return {
            ...table,
            columns: updatedColumns,
            rows: updatedRows
          };
        }
        return table;
      })
    );
  };

  const addRow = (tableId: string) => {
    setTables(
      tables.map(table => {
        if (table.id === tableId) {
          const newRow: RowType = {
            id: uuidv4(),
            cells: table.columns.reduce((acc, column) => {
              acc[column.id] = '';
              return acc;
            }, {} as { [columnId: string]: string })
          };

          return {
            ...table,
            rows: [...table.rows, newRow]
          };
        }
        return table;
      })
    );
  };

  const removeRow = (tableId: string, rowId: string) => {
    setTables(
      tables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            rows: table.rows.filter(row => row.id !== rowId)
          };
        }
        return table;
      })
    );
  };

  const updateCell = (tableId: string, rowId: string, columnId: string, value: string) => {
    setTables(
      tables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            rows: table.rows.map(row => {
              if (row.id === rowId) {
                return {
                  ...row,
                  cells: {
                    ...row.cells,
                    [columnId]: value
                  }
                };
              }
              return row;
            })
          };
        }
        return table;
      })
    );
  };

  const updateTableName = (tableId: string, newName: string) => {
    setTables(
      tables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            name: newName
          };
        }
        return table;
      })
    );
  };

  return (
    <Box>
      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <HeaderBox>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <TableChartIcon sx={{ mr: 1 }} />
            Tables
          </Typography>
        </HeaderBox>
        
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Create up to 3 tables with custom columns and rows.
          </Typography>
          
          {tables.length < 3 && (
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                  <TextField
                    fullWidth
                    label="Enter table name"
                    variant="outlined"
                    size="small"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                  />
                </Grid>
                <Grid item>
                  <Button 
                    variant="contained" 
                    startIcon={<TableChartIcon />}
                    onClick={addTable}
                    disabled={!newTableName.trim()}
                    sx={{
                      backgroundColor: '#0D47A1',
                      color: '#fff',
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: '#0A3882'
                      }
                    }}
                  >
                    Add Table
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {tables.map(table => (
            <Paper key={table.id} sx={{ mb: 3, overflow: 'hidden' }}>
              <HeaderBox>
                <TableNameInput
                  placeholder="Table Name"
                  variant="outlined"
                  size="small"
                  value={table.name}
                  onChange={(e) => updateTableName(table.id, e.target.value)}
                  InputProps={{
                    startAdornment: <TableChartIcon sx={{ mr: 1, color: 'primary.dark' }} />,
                  }}
                />
                <Button 
                  variant="outlined" 
                  color="error"
                  size="small"
                  onClick={() => removeTable(table.id)}
                  sx={{ bgcolor: 'background.paper' }}
                >
                  Remove Table
                </Button>
              </HeaderBox>
              
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Grid item xs>
                    <TextField
                      fullWidth
                      label="Enter column name"
                      variant="outlined"
                      size="small"
                      value={newColumnName[table.id] || ''}
                      onChange={(e) => setNewColumnName({
                        ...newColumnName,
                        [table.id]: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item>
                    <Stack direction="row" spacing={1}>
                      <Button 
                        variant="outlined" 
                        startIcon={<ViewColumnIcon />}
                        onClick={() => addColumn(table.id)}
                        disabled={!newColumnName[table.id]?.trim()}
                        size="small"
                      >
                        Add Column
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<TableRowsIcon />}
                        onClick={() => addRow(table.id)}
                        disabled={table.columns.length === 0}
                        size="small"
                      >
                        Add Row
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                {table.columns.length > 0 ? (
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          {table.columns.map(column => (
                            <TableCell key={column.id}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" fontWeight="medium">{column.name}</Typography>
                                <IconButton 
                                  size="small" 
                                  onClick={() => removeColumn(table.id, column.id)}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {table.rows.map((row) => (
                          <StyledTableRow key={row.id}>
                            {table.columns.map(column => (
                              <TableCell key={column.id} sx={{ position: 'relative' }}>
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  size="small"
                                  value={row.cells[column.id] || ''}
                                  onChange={(e) => updateCell(table.id, row.id, column.id, e.target.value)}
                                />
                                {column === table.columns[table.columns.length - 1] && (
                                  <RowDeleteButton
                                    size="small"
                                    onClick={() => removeRow(table.id, row.id)}
                                    className="row-delete-button"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </RowDeleteButton>
                                )}
                              </TableCell>
                            ))}
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">
                    Add columns to start building your table
                  </Alert>
                )}
              </Box>
            </Paper>
          ))}
          
          {tables.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Add a table to get started
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TableEditor; 