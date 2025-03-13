import React, { useState } from 'react';
import { Button, Form, Table, Card, Row, Col } from 'react-bootstrap';
import { Table as TableType, Column, Row as RowType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';

const TableContainer = styled.div`
  margin-bottom: 20px;
`;

const ScrollableTable = styled(Table)`
  width: 100%;
  overflow-x: auto;
  display: block;
`;

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
    <div>
      <h3>Tables ({tables.length}/3)</h3>
      
      {tables.length < 3 && (
        <Form className="mb-4">
          <Row>
            <Col>
              <Form.Control
                type="text"
                placeholder="Enter table name"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
              />
            </Col>
            <Col xs="auto">
              <Button onClick={addTable}>Add Table</Button>
            </Col>
          </Row>
        </Form>
      )}
      
      {tables.map(table => (
        <TableContainer key={table.id}>
          <Card>
            <Card.Header>
              <Row className="align-items-center">
                <Col>
                  <Form.Control
                    type="text"
                    value={table.name}
                    onChange={(e) => updateTableName(table.id, e.target.value)}
                    className="font-weight-bold"
                  />
                </Col>
                <Col xs="auto">
                  <Button variant="danger" onClick={() => removeTable(table.id)} size="sm">
                    Remove Table
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Form className="mb-3">
                <Row>
                  <Col>
                    <Form.Control
                      type="text"
                      placeholder="Enter column name"
                      value={newColumnName[table.id] || ''}
                      onChange={(e) => setNewColumnName({
                        ...newColumnName,
                        [table.id]: e.target.value
                      })}
                    />
                  </Col>
                  <Col xs="auto">
                    <Button onClick={() => addColumn(table.id)}>Add Column</Button>
                  </Col>
                  <Col xs="auto">
                    <Button onClick={() => addRow(table.id)}>Add Row</Button>
                  </Col>
                </Row>
              </Form>
              
              {table.columns.length > 0 && (
                <div className="table-responsive">
                  <ScrollableTable striped bordered hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        {table.columns.map(column => (
                          <th key={column.id}>
                            <div className="d-flex justify-content-between align-items-center">
                              <span>{column.name}</span>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeColumn(table.id, column.id)}
                              >
                                ×
                              </Button>
                            </div>
                          </th>
                        ))}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rowIndex) => (
                        <tr key={row.id}>
                          <td>{rowIndex + 1}</td>
                          {table.columns.map(column => (
                            <td key={column.id}>
                              <Form.Control
                                type="text"
                                value={row.cells[column.id] || ''}
                                onChange={(e) => updateCell(table.id, row.id, column.id, e.target.value)}
                              />
                            </td>
                          ))}
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeRow(table.id, row.id)}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </ScrollableTable>
                </div>
              )}
              
              {table.columns.length === 0 && (
                <div className="alert alert-info">
                  Add columns to start building your table
                </div>
              )}
            </Card.Body>
          </Card>
        </TableContainer>
      ))}
      
      {tables.length === 0 && (
        <div className="alert alert-info">
          Add a table to get started
        </div>
      )}
    </div>
  );
};

export default TableEditor; 