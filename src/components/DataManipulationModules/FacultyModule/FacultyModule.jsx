import { Button, TextField } from '@material-ui/core';
import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { CSS, SQL_ERRORS } from '../../../utils/constants';

import GeneralModule from '../GeneralModule/GeneralModule';

import './../../../App.global.css';
import { ServiceContext } from '../../../App';
import { utilityFunctions } from '../../../utils/utilityFunctions';

const tableColumns = [
  utilityFunctions.getColumnObjectForDataTable('code', 'Code', 0.3),
  utilityFunctions.getColumnObjectForDataTable('name', 'Name', 0.7),
];

export default function FacultyModule() {
  const { retrieverService, storageService } = useContext(ServiceContext);

  const [allFaculties, setAllFaculties] = useState([]);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchAllFaculties();
  }, []);

  useEffect(() => {
    if (successMessage.length > 0) setErrorMessage('');
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage.length > 0) setSuccessMessage('');
  }, [errorMessage]);

  const fetchAllFaculties = async () => {
    const faculties = await retrieverService.getAllFaculties();
    console.info('All faculties', faculties);
    setAllFaculties(faculties);
  };

  const validateInput = () => {
    if (!utilityFunctions.blankCheck(code)) {
      setErrorMessage("Faculty code can't be blank");
      return false;
    }
    if (code.includes(' ')) {
      setErrorMessage("Faculty code can't have any spaces");
      return false;
    }
    if (!utilityFunctions.blankCheck(name)) {
      setErrorMessage("Faculty name can't be blank");
      return false;
    }
    return true;
  };

  const clearInput = () => {
    setCode('');
    setName('');
  };

  const insert = async () => {
    console.info('Inserting for ', code, name);

    if (!validateInput()) return false;

    try {
      await storageService.saveFaculty({ code, name });
    } catch (err) {
      if (err.errno === SQL_ERRORS.uniqueConstraint) {
        setErrorMessage(`A faculty is already present with code ${code}`);
      } else {
        setErrorMessage(`Unknown error: ${err.message}`);
      }
      return false;
    }

    setSuccessMessage(`Successfully inserted faculty ${code}`);

    // Update the data according to the new insertion
    fetchAllFaculties();

    return true;
  };

  const deleteFunction = async (code) => {
    await storageService.deleteFaculty(code);
  };

  const afterDeletion = async () => {
    await fetchAllFaculties();
  };

  const getInputForm = () => {
    return (
      <div>
        <TextField
          style={CSS.inputFormField}
          label="Faculty Code"
          variant="outlined"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          size="small"
        />
        <TextField
          style={CSS.inputFormField}
          label="Faculty Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="small"
        />
      </div>
    );
  };

  return (
    <div style={{}} className="HorizontallyCentered">
      <GeneralModule
        entityName="Faculty"
        errorMessage={errorMessage}
        successMessage={successMessage}
        tableColumns={tableColumns}
        tableRows={allFaculties}
        id="code"
        insertForm={getInputForm()}
        insertFunction={insert}
        deleteFunction={deleteFunction}
        afterDeletion={afterDeletion}
        clearInput={clearInput}
      />
    </div>
  );
}
