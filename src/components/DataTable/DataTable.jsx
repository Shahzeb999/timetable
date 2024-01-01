import React from 'react';

import { DataGrid, gridRowCountSelector } from '@material-ui/data-grid';

import '../../App.global.css';

/** Columns and rows object for reference */
const columns = [
  { field: 'id', headerName: 'ID', flex: 1 },
  { field: 'firstName', headerName: 'First name', flex: 1 },
  { field: 'lastName', headerName: 'Last name', flex: 1 },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    flex: 1,
  },
];

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
];

export default function DataTable(props) {
  const { columns, rows, selection, setSelection, id } = props;

  const getTableHeight = () => {
    if (rows.length < 5) return '30vh';
    if (rows.length < 9) return '50vh';
    return '60vh';
  };

  return (
    <div
      style={{
        height: getTableHeight(),
        width: '100%',
      }}
    >
      <DataGrid
        columns={columns.map((column, index) => ({ ...column, id: index }))}
        rows={rows.map((row, index) => ({ ...row, id: row[id] }))}
        pageSize={25}
        checkboxSelection
        onSelectionModelChange={(newSelection) => {
          setSelection(newSelection.selectionModel);
        }}
        selectionModel={selection}
      />
    </div>
  );
}
