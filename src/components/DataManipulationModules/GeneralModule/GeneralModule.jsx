/* eslint-disable react/prop-types */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Alert } from '@material-ui/lab';

import BackspaceOutlinedIcon from '@material-ui/icons/BackspaceOutlined';

import { Button } from '@material-ui/core';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteForeverTwoToneIcon from '@material-ui/icons/DeleteForeverTwoTone';
import ToggleButton from '@material-ui/lab/ToggleButton';
// import '../../../App.global.css';
import DataTable from '../../DataTable/DataTable';
import MyTooltip from '../../MyTooltip/MyTooltip';

import { CSS } from '../../../utils/constants';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

export default function GeneralModule(props) {
  const {
    entityName,
    insertForm,
    tableColumns,
    tableRows,
    successMessage,
    errorMessage,
    id,
    insertFunction,
    deleteFunction,
    afterDeletion,
    clearInput,
  } = props;

  const classes = useStyles();

  const [tableSelection, setTableSelection] = React.useState([]);
  const [
    clearInputAfterInsertion,
    setClearInputAfterInsertion,
  ] = React.useState(true);

  const deleteSelected = async () => {
    const promises = [];
    tableSelection.forEach(async (selectedId) => {
      promises.push(deleteFunction(selectedId));
    });
    await Promise.all(promises);
    await afterDeletion();
  };

  const handleInsert = async () => {
    if (await insertFunction()) if (clearInputAfterInsertion) clearInput();
  };

  const clearInputAfterInsertionToggleTooltip = clearInputAfterInsertion
    ? 'Click to disable clearing input after insertion'
    : 'Click to enable clearing input after insertion';

  return (
    <div
      style={{ width: '100%', padding: '2% 5% 0% 5%' }}
      className="HorizontallyCentered"
    >
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.heading}>
            Add New {entityName}
          </Typography>
        </AccordionSummary>

        <div
          style={{ width: '100%', textAlign: 'right', paddingRight: '20px' }}
        >
          <MyTooltip title={clearInputAfterInsertionToggleTooltip}>
            <ToggleButton
              value="check"
              selected={clearInputAfterInsertion}
              onChange={() => {
                setClearInputAfterInsertion(!clearInputAfterInsertion);
              }}
            >
              <BackspaceOutlinedIcon />
            </ToggleButton>
          </MyTooltip>
        </div>
        <AccordionDetails>
          {insertForm}
          &emsp;
          <Button
            variant="outlined"
            onClick={handleInsert}
            style={CSS.greenButton}
          >
            Insert
          </Button>
        </AccordionDetails>

        <AccordionDetails>
          {successMessage.length > 0 && (
            <Alert severity="success" style={{ width: '100%' }}>
              {successMessage}
            </Alert>
          )}
          {errorMessage.length > 0 && (
            <Alert severity="error" style={{ width: '100%' }}>
              {errorMessage}
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>

      <div
        style={{
          width: '100%',
          textAlign: 'left',
          minHeight: '46px',
        }}
      >
        {tableSelection.length > 0 && (
          <MyTooltip title={`Delete selected ${entityName}s`}>
            <Button
              style={{ backgroundColor: 'red', color: 'white' }}
              variant="outlined"
              onClick={deleteSelected}
            >
              <DeleteForeverTwoToneIcon />
            </Button>
          </MyTooltip>
        )}
      </div>
      <DataTable
        rows={tableRows}
        columns={tableColumns}
        selection={tableSelection}
        setSelection={setTableSelection}
        id={id}
      />
    </div>
  );
}
