/* eslint-disable no-console */
import { Button, TextField } from '@material-ui/core';
import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { CSS, SQL_ERRORS } from '../../../utils/constants';

import GeneralModule from '../GeneralModule/GeneralModule';
import MultiSelectAutoComplete from '../../MultiSelectAutoComplete/MultiSelectAutoComplete';

import '../../../App.global.css';
import { ServiceContext } from '../../../App';
import { utilityFunctions } from '../../../utils/utilityFunctions';

const tableColumns = [
  utilityFunctions.getColumnObjectForDataTable('roomNo', 'Room No', 0.3),
  utilityFunctions.getColumnObjectForDataTable('types', 'Room Types', 0.7),
];

export default function RoomsModule() {
  const { retrieverService, storageService } = useContext(ServiceContext);

  const [allRooms, setAllRooms] = useState([]);

  const [roomNo, setRoomNo] = useState('');
  const [types, setTypes] = useState([]);

  const [typesOptions, setTypesOptions] = useState([]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (successMessage.length > 0) setErrorMessage('');
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage.length > 0) setSuccessMessage('');
  }, [errorMessage]);

  const fetchAllRooms = async () => {
    const rooms = await retrieverService.getAllRooms();
    console.info('All rooms', rooms);
    setAllRooms(rooms);
  };

  const fetchTypesOptions = async () => {
    const distinctRooms = await retrieverService.getDistinctRoomTypes();
    console.info('Distinct rooms are: ', distinctRooms);
    setTypesOptions(distinctRooms);
  };

  useEffect(() => {
    fetchTypesOptions();
    fetchAllRooms();
  }, []);

  const validateInput = () => {
    if (!utilityFunctions.blankCheck(roomNo)) {
      setErrorMessage("Room number can't be blank");
      return false;
    }
    if (!types || types.length === 0) {
      setErrorMessage('At least one type must be provided');
      return false;
    }
    return true;
  };

  const clearInput = () => {
    setRoomNo('');
    setTypes([]);
  };

  const insert = async () => {
    console.info('Inserting for ', roomNo, types);

    if (!validateInput()) return false;

    try {
      console.log('Calling save room');
      await storageService.saveRoom({ roomNo, types });
      console.log('Finished save room');
    } catch (err) {
      if (err.errno === SQL_ERRORS.uniqueConstraint) {
        setErrorMessage(`A room is already present with room no. ${roomNo} `);
      } else {
        setErrorMessage(`Unknown error: ${err.message}`);
      }
      return false;
    }
    console.log('Doing post processing');

    setSuccessMessage(`Successfully inserted room ${roomNo}`);

    // Update the data according to the new insertion
    fetchAllRooms();
    fetchTypesOptions();
    return true;
  };

  const deleteFunction = async (roomNo) => {
    await storageService.deleteRoom(roomNo);
  };

  const afterDeletion = async () => {
    await fetchAllRooms();
    await fetchTypesOptions();
  };

  const getInputForm = () => {
    return (
      <div>
        <TextField
          style={CSS.inputFormField}
          label="Room Number"
          variant="outlined"
          value={roomNo}
          onChange={(e) => setRoomNo(e.target.value)}
          size="small"
        />
        <MultiSelectAutoComplete
          style={CSS.inputFormField}
          options={typesOptions}
          label="Room Types"
          size="small"
          values={types}
          setValues={setTypes}
          freeSolo
        />
      </div>
    );
  };

  return (
    <div style={{}} className="HorizontallyCentered">
      <GeneralModule
        entityName="Room"
        errorMessage={errorMessage}
        successMessage={successMessage}
        tableColumns={tableColumns}
        tableRows={allRooms}
        id={'roomNo'}
        insertForm={getInputForm()}
        insertFunction={insert}
        deleteFunction={deleteFunction}
        afterDeletion={afterDeletion}
        clearInput={clearInput}
      />
    </div>
  );
}
