/* eslint-disable react/jsx-props-no-spreading */
import { Button, TextField, Switch } from '@material-ui/core';
import React from 'react';
import { useState, useEffect, useContext } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { CSS, SQL_ERRORS } from '../../../utils/constants';

import GeneralModule from '../GeneralModule/GeneralModule';

import './../../../App.global.css';
import { ServiceContext } from '../../../App';
import { utilityFunctions } from '../../../utils/utilityFunctions';
import MultiSelectAutoComplete from '../../MultiSelectAutoComplete/MultiSelectAutoComplete';
import MultiSelectAutocompleteRepeatedValues from '../../MultiSelectAutocompleteRepeatedValues/MultiSelectAutocompleteRepeatedValues';
import MyTooltip from '../../MyTooltip/MyTooltip';

const tableColumns = [
  utilityFunctions.getColumnObjectForDataTable('subjectCode', 'Subject', 0.4),
  utilityFunctions.getColumnObjectForDataTable(
    'rooms',
    'Preassigned rooms',
    0.3
  ),
  utilityFunctions.getColumnObjectForDataTable(
    'roomTypes',
    'Types of Required Rooms',
    0.4
  ),
  utilityFunctions.getColumnObjectForDataTable('faculties', 'Faculties', 0.4),
];

export default function KundliModuleInternal(props) {
  const { selectedSectionString } = props;
  const { retrieverService, storageService } = useContext(ServiceContext);

  const [allEvents, setAllEvents] = useState([]);

  const [allSubjects, setAllSubjects] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [allRoomTypes, setAllRoomTypes] = useState([]);
  const [allFaculties, setAllfaculties] = useState([]);

  const [subject, setSubject] = useState('');
  const [subjectDisplayValues, setSubjectDisplayValues] = useState([]);
  const [
    subjectDisplayValueToCodeMap,
    setSubjectDisplayValueToCodeMap,
  ] = useState({});

  const [tableRows, setTableRows] = useState([]);
  // Holds the room numbers of pre-assigned rooms
  const [rooms, setRooms] = useState([]);
  // Holds the room types of unassigned rooms
  const [roomTypes, setRoomTypes] = useState([]);
  // Holds the code of faculties that are required for the event
  const [faculties, setFaculties] = useState([]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (successMessage.length > 0) setErrorMessage('');
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage.length > 0) setSuccessMessage('');
  }, [errorMessage]);

  const fetchAllEvents = async () => {
    const fetchedEvents = await retrieverService.getAllEventsForSection(
      utilityFunctions.sectionStringToSection(selectedSectionString)
    );
    console.log('FetchedEvents:', fetchedEvents);
    setAllEvents(fetchedEvents);
  };
  const fetchAllSubjects = async () => {
    const subjects = await retrieverService.getAllSubjects();
    setAllSubjects(subjects);
  };

  const fetchAllRooms = async () => {
    const fetchedRooms = await retrieverService.getAllRooms();
    setAllRooms(fetchedRooms);
  };

  const fetchAllRoomTypes = async () => {
    const fetchedRoomTypes = await retrieverService.getDistinctRoomTypes();
    setAllRoomTypes(fetchedRoomTypes);
  };

  const fetchAllFaculties = async () => {
    const fetchedFaculties = await retrieverService.getAllFaculties();
    setAllfaculties(fetchedFaculties);
  };

  const fetchAllAutocompleteOptions = () => {
    fetchAllSubjects();
    fetchAllRooms();
    fetchAllRoomTypes();
    fetchAllFaculties();
  };

  const clearInput = () => {
    setSubject('');
    setRooms([]);
    setRoomTypes([]);
    setFaculties([]);
  };

  useEffect(() => {
    if (selectedSectionString === '') return;
    fetchAllAutocompleteOptions();
    fetchAllEvents();
    clearInput();
  }, [selectedSectionString]);

  useEffect(() => {
    const newMap = {};
    const newDisplayValues = [];

    allSubjects.forEach((oneSubject) => {
      const displayValue = `${oneSubject.code} (${oneSubject.name})`;
      newDisplayValues.push(displayValue);
      newMap[displayValue] = oneSubject.code;
    });
    setSubjectDisplayValueToCodeMap(newMap);
    setSubjectDisplayValues(newDisplayValues);
  }, [allSubjects]);

  useEffect(() => {
    const getSubjectDisplayValueFromCode = (code) => {
      const validSubject = allSubjects.find(
        (oneSubject) => code === oneSubject.code
      );
      return `${validSubject.code} (${validSubject.name})`;
    };
    setTableRows(
      allEvents.map((event) => ({
        ...event,
        subjectCode: getSubjectDisplayValueFromCode(event.subjectCode),
      }))
    );
    console.log('All events: ', allEvents, 'Table rows: ', tableRows);
  }, [allEvents]);

  const validateInput = () => {
    if (!utilityFunctions.blankCheck(subject)) {
      setErrorMessage('Please select a subject from the dropdown list');
      return false;
    }
    return true;
  };

  const insert = async () => {
    console.info('Inserting for ', subject, rooms, roomTypes, faculties);

    if (!validateInput()) return false;
    const sectionJson = utilityFunctions.sectionStringToSection(
      selectedSectionString
    );

    try {
      await storageService.saveEvent({
        sectionYear: sectionJson.year,
        sectionBranch: sectionJson.branch,
        sectionLetter: sectionJson.letter,
        subjectCode: subjectDisplayValueToCodeMap[subject],
        rooms,
        roomTypes,
        faculties,
      });
    } catch (err) {
      if (err.errno === SQL_ERRORS.uniqueConstraint) {
        setErrorMessage(
          `An event is already present for ${selectedSectionString} and ${subject}`
        );
      } else {
        setErrorMessage(`Unknown error: ${err.message}`);
      }
      return false;
    }

    setSuccessMessage(
      `Successfully inserted event ${selectedSectionString} and ${subject}`
    );

    fetchAllEvents();
    return true;
  };

  // TO DO: DO it after populating table
  const deleteFunction = async (uniqueId) => {
    const [sectionString, subjectCode] = uniqueId.split(',');
    const sectionObject = utilityFunctions.sectionStringToSection(
      sectionString
    );

    await storageService.deleteEvent({
      sectionYear: sectionObject.year,
      sectionBranch: sectionObject.branch,
      sectionLetter: sectionObject.letter,
      subjectCode,
    });
  };

  const afterDeletion = async () => {
    fetchAllAutocompleteOptions();
    fetchAllEvents();
  };

  const getInputForm = () => {
    return (
      <div>
        {/** Subject */}
        <Autocomplete
          size="small"
          style={CSS.inputFormField}
          inputValue={subject}
          onInputChange={(event, newValue) => {
            setSubject(newValue);
          }}
          options={subjectDisplayValues}
          // getOptionLabel={(option) => `${option.code} (${option.name})`}
          // renderOption={(option) => `${option.code} (${option.name})`}
          renderInput={(params) => (
            <TextField {...params} label="Subject" variant="outlined" />
          )}
        />
        {/** Pre assigned rooms */}
        <MultiSelectAutoComplete
          style={CSS.inputFormField}
          options={allRooms.map((room) => room.roomNo)}
          label="Preassigned rooms"
          placeholder="Any rooms that are specifically required"
          size="small"
          values={rooms}
          setValues={setRooms}
        />
        {/** Rooms to be assigned */}
        <MultiSelectAutocompleteRepeatedValues
          style={CSS.inputFormField}
          options={allRoomTypes}
          label="Rooms to be assigned"
          size="small"
          placeholder="Any room group from which a room has to be assigned"
          values={roomTypes}
          setValues={setRoomTypes}
        />
        {/** Faculties to be assigned */}
        <MultiSelectAutoComplete
          style={CSS.inputFormField}
          options={allFaculties.map((faculty) => faculty.code)}
          label="Faculties required"
          size="small"
          placeholder="Factulties required for one instance of this event"
          values={faculties}
          setValues={setFaculties}
        />
      </div>
    );
  };

  return (
    <div style={{}} className="HorizontallyCentered">
      <GeneralModule
        entityName="Event"
        errorMessage={errorMessage}
        successMessage={successMessage}
        tableColumns={tableColumns}
        tableRows={tableRows}
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
