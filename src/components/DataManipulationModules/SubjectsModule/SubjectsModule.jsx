import { Button, TextField } from '@material-ui/core';
import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { CSS, SQL_ERRORS } from '../../../utils/constants';

import GeneralModule from '../GeneralModule/GeneralModule';
import MyTooltip from '../../MyTooltip/MyTooltip';

import './../../../App.global.css';
import { ServiceContext } from '../../../App';
import { utilityFunctions } from '../../../utils/utilityFunctions';

const tableColumns = [
  utilityFunctions.getColumnObjectForDataTable('code', 'Code', 0.3),
  utilityFunctions.getColumnObjectForDataTable('name', 'Name', 0.5),
  utilityFunctions.getColumnObjectForDataTable(
    'eventsCount',
    'Events Count',
    0.2,
    'Number of events in 1 periodic cycle'
  ),
  utilityFunctions.getColumnObjectForDataTable(
    'slotSize',
    'Slot Size',
    0.2,
    'Slots required for 1 continuous event'
  ),
];

export default function SubjectsModule() {
  const { retrieverService, storageService } = useContext(ServiceContext);

  const [allSubjects, setAllSubjects] = useState([]);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [eventsCount, setEventsCount] = useState(0);
  const [slotSize, setSlotSize] = useState(0);
  const [tutorialEventsCount, setTutorialEventsCount] = useState(0);
  const [tutorialSlotSize, setTutorialSlotSize] = useState(0);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchAllSubjects();
  }, []);

  useEffect(() => {
    if (successMessage.length > 0) setErrorMessage('');
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage.length > 0) setSuccessMessage('');
  }, [errorMessage]);

  const fetchAllSubjects = async () => {
    const subjects = await retrieverService.getAllSubjects();
    console.info('All Subjects', subjects);
    setAllSubjects(subjects);
  };

  const validateInput = () => {
    if (!utilityFunctions.blankCheck(code)) {
      setErrorMessage("Subject code can't be blank");
      return false;
    }
    if (code.includes(',')) {
      setErrorMessage("Subject code can't contain any commas");
      return false;
    }
    if (!utilityFunctions.blankCheck(name)) {
      setErrorMessage("Subject name can't be blank");
      return false;
    }
    if (eventsCount === 0 && tutorialEventsCount === 0) {
      setErrorMessage('There should be at least one event for a subject');
      return false;
    }
    if (eventsCount !== 0 && slotSize === 0) {
      setErrorMessage("Slot size can't be 0");
      return false;
    }
    if (tutorialEventsCount !== 0 && tutorialSlotSize === 0) {
      setErrorMessage("Tutorial slot size can't be 0");
      return false;
    }
    return true;
  };

  const clearInput = () => {
    setCode('');
    setName('');
    setEventsCount(0);
    setSlotSize(0);
    setTutorialEventsCount(0);
    setTutorialSlotSize(0);
  };

  const insert = async () => {
    console.info(
      'Inserting for ',
      code,
      name,
      slotSize,
      eventsCount,
      tutorialEventsCount,
      tutorialSlotSize
    );

    if (!validateInput()) return false;

    try {
      await storageService.saveSubject({
        code,
        name,
        slotSize,
        eventsCount,
      });
    } catch (err) {
      if (err.errno === SQL_ERRORS.uniqueConstraint) {
        setErrorMessage(`A subject is already present with code ${code} `);
      } else {
        setErrorMessage(`Unknown error: ${err.message}`);
      }
      return false;
    }

    // Update the data according to the new insertion
    fetchAllSubjects();

    if (tutorialEventsCount > 0) {
      const tutorialCode = `${code}(T)`;
      try {
        await storageService.saveSubject({
          code: tutorialCode,
          name,
          slotSize: tutorialSlotSize,
          eventsCount: tutorialEventsCount,
        });
      } catch (err) {
        if (err.errno === SQL_ERRORS.uniqueConstraint) {
          setErrorMessage(
            `A subject is already present with code ${tutorialCode} `
          );
        } else {
          setErrorMessage(`Unknown error: ${err.message}`);
        }
        return false;
      }
    }

    setSuccessMessage(`Successfully inserted subject ${code}`);

    // Update the data according to the new insertion
    fetchAllSubjects();

    return true;
  };

  const deleteFunction = async (code) => {
    await storageService.deleteSubject(code);
  };

  const afterDeletion = async () => {
    await fetchAllSubjects();
  };

  const getInputForm = () => {
    return (
      <div>
        <TextField
          style={CSS.inputFormField}
          label="Subject Code"
          variant="outlined"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          size="small"
        />
        <TextField
          style={CSS.inputFormField}
          label="Subject Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="small"
        />

        <TextField
          style={CSS.inputFormField}
          label="Events Count"
          variant="outlined"
          type="number"
          value={eventsCount}
          onChange={(e) => setEventsCount(Math.max(0, e.target.value))}
          size="small"
        />

        <TextField
          style={CSS.inputFormField}
          label="Slot Size"
          variant="outlined"
          type="number"
          disabled={eventsCount === 0}
          value={slotSize}
          onChange={(e) => setSlotSize(Math.max(0, e.target.value))}
          size="small"
        />

        <TextField
          style={CSS.inputFormField}
          label="Tutorial Events Count"
          variant="outlined"
          type="number"
          value={tutorialEventsCount}
          onChange={(e) => setTutorialEventsCount(Math.max(0, e.target.value))}
          size="small"
        />
        <TextField
          style={CSS.inputFormField}
          label="Tutorial Slot Size"
          variant="outlined"
          type="number"
          disabled={tutorialEventsCount === 0}
          value={tutorialSlotSize}
          onChange={(e) => setTutorialSlotSize(Math.max(0, e.target.value))}
          size="small"
        />
      </div>
    );
  };

  return (
    <div style={{}} className="HorizontallyCentered">
      <GeneralModule
        entityName="Subject"
        errorMessage={errorMessage}
        successMessage={successMessage}
        tableColumns={tableColumns}
        tableRows={allSubjects}
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
