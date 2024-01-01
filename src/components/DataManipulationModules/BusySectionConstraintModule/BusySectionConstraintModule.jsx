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
  utilityFunctions.getColumnObjectForDataTable('sectionString', 'Section', 0.3),
  utilityFunctions.getColumnObjectForDataTable('day', 'Day', 0.1),
  utilityFunctions.getColumnObjectForDataTable('slot', 'Slot', 0.1),
];

export default function BusySectionConstraintModule() {
  const { retrieverService, storageService } = useContext(ServiceContext);

  const [allBusySectionConstraints, setAllBusySectionConstraints] = useState(
    []
  );

  const [allSections, setAllSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAllBusySectionConstraints = async () => {
    const constraints = await retrieverService.getAllBusySectionConstraints();
    setAllBusySectionConstraints(constraints);
  };

  useEffect(() => {
    fetchAllSections();
    fetchAllBusySectionConstraints();
  }, []);

  useEffect(() => {
    if (successMessage.length > 0) setErrorMessage('');
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage.length > 0) setSuccessMessage('');
  }, [errorMessage]);

  const fetchAllSections = async () => {
    const sections = await retrieverService.getAllSections();
    setAllSections(sections);
  };

  const validateInput = () => {
    if (selectedSections.length === 0) {
      setErrorMessage('Please select at least 1 section');
      return false;
    }
    if (timeSlots.length === 0) {
      setErrorMessage('Please select at least 1 time slot');
      return false;
    }
    return true;
  };

  const clearInput = () => {
    setSelectedSections([]);
    setTimeSlots([]);
  };

  const insert = async () => {
    console.info('Inserting for ', selectedSections, timeSlots);

    if (!validateInput()) return false;

    try {
      await storageService.saveBusySectionConstraints(
        selectedSections.map((section) =>
          utilityFunctions.sectionStringToSection(section)
        ),
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
    fetchAllBusySectionConstraints();

    return true;
  };

  const deleteFunction = async (id) => {
    const [letter, branch, year, day, slot] = id.split(' ');
    await storageService.deleteBusySectionConstraint({ letter, branch, year }, [
      day,
      slot,
    ]);
  };

  const afterDeletion = async () => {
    fetchAllBusySectionConstraints();
  };

  const getInputForm = () => {
    return (
      <div>
        <MultiSelectAutoComplete
          style={CSS.inputFormField}
          options={allSections.map((section) => section.toString())}
          label="Sections"
          size="small"
          values={selectedSections}
          setValues={setSelectedSections}
        />
        <TimeSlotsInput timeSlots={timeSlots} setTimeSlots={setTimeSlots} />
      </div>
    );
  };

  return (
    <div style={{}} className="HorizontallyCentered">
      <GeneralModule
        entityName="Busy Section Constraint"
        errorMessage={errorMessage}
        successMessage={successMessage}
        tableColumns={tableColumns}
        tableRows={allBusySectionConstraints.map((constraint) => ({
          ...constraint,
          sectionString: utilityFunctions.sectionToString({ ...constraint }),
        }))}
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
