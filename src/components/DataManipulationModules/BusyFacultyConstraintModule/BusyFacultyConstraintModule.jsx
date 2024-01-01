import { Button, TextField } from '@material-ui/core';
import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { CSS, SQL_ERRORS } from '../../../utils/constants';

import GeneralModule from '../GeneralModule/GeneralModule';

import { ServiceContext } from '../../../App';
import { utilityFunctions } from '../../../utils/utilityFunctions';
import MultiSelectAutoComplete from '../../MultiSelectAutoComplete/MultiSelectAutoComplete';
import TimeSlotsInput from '../../TimeSlotsInput/TimeSlotsInput';

const tableColumns = [
  utilityFunctions.getColumnObjectForDataTable('code', 'Faculty Code', 0.3),
  utilityFunctions.getColumnObjectForDataTable('day', 'Day', 0.1),
  utilityFunctions.getColumnObjectForDataTable('slot', 'Slot', 0.1),
];

export default function BusyFacultyConstraintModule() {
  const { retrieverService, storageService } = useContext(ServiceContext);

  const [allBusyFacultyConstraints, setAllBusyFacultyConstraints] = useState(
    []
  );

  const [allFaculties, setAllFaculties] = useState([]);
  const [selectedFacultyCodes, setSelectedFacultyCodes] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAllBusyFacultyConstraints = async () => {
    const constraints = await retrieverService.getAllBusyFacultyConstraints();
    setAllBusyFacultyConstraints(constraints);
  };

  useEffect(() => {
    fetchAllFaculties();
    fetchAllBusyFacultyConstraints();
  }, []);

  useEffect(() => {
    if (successMessage.length > 0) setErrorMessage('');
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage.length > 0) setSuccessMessage('');
  }, [errorMessage]);

  const fetchAllFaculties = async () => {
    const faculties = await retrieverService.getAllFaculties();
    setAllFaculties(faculties);
  };

  const validateInput = () => {
    if (selectedFacultyCodes.length === 0) {
      setErrorMessage('Please select at least 1 faculty');
      return false;
    }
    if (timeSlots.length === 0) {
      setErrorMessage('Please select at least 1 time slot');
      return false;
    }
    return true;
  };

  const clearInput = () => {
    setSelectedFacultyCodes([]);
    setTimeSlots([]);
  };

  const insert = async () => {
    console.info('Inserting for ', selectedFacultyCodes, timeSlots);

    if (!validateInput()) return false;

    try {
      await storageService.saveBusyFacultyConstraint(
        selectedFacultyCodes,
        timeSlots
      );
    } catch (err) {
      if (err.errno === SQL_ERRORS.uniqueConstraint) {
        setErrorMessage(
          `A constraint likely already exists for the given information`
        );
      } else {
        setErrorMessage(`Unknown error: ${err.message}`);
      }
      return false;
    }

    setSuccessMessage(`Successfully inserted constraint`);

    // Update the data according to the new insertion
    fetchAllBusyFacultyConstraints();

    return true;
  };

  const deleteFunction = async (id) => {
    const [facultyCode, day, slot] = id.split(' ');
    await storageService.deleteBusyFacultyConstraint(facultyCode, [day, slot]);
  };

  const afterDeletion = async () => {
    fetchAllBusyFacultyConstraints();
  };

  const getInputForm = () => {
    return (
      <div>
        <MultiSelectAutoComplete
          style={CSS.inputFormField}
          options={allFaculties.map((faculty) => faculty.code)}
          label="Faculties"
          size="small"
          values={selectedFacultyCodes}
          setValues={setSelectedFacultyCodes}
        />
        <TimeSlotsInput timeSlots={timeSlots} setTimeSlots={setTimeSlots} />
      </div>
    );
  };

  return (
    <div style={{}} className="HorizontallyCentered">
      <GeneralModule
        entityName="Busy Faculty Constraint"
        errorMessage={errorMessage}
        successMessage={successMessage}
        tableColumns={tableColumns}
        tableRows={allBusyFacultyConstraints}
        id="id"
        insertForm={getInputForm()}
        insertFunction={insert}
        deleteFunction={deleteFunction}
        afterDeletion={afterDeletion}
        clearInput={clearInput}
      />
    </div>
  );
}
