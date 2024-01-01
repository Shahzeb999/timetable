import React from 'react';
import { useState, useEffect, useContext } from 'react';

import { Alert, Autocomplete } from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { Grid } from '@material-ui/core';

import { ServiceContext } from '../../App';
import {
  getEventForFaculty,
  getEventsForBaseSection,
  getEventsForRoom,
} from '../../utils/viewTimetableUtils';
import TimetableGrid from './TimetableGrid';
import BigAlert from '../BigAlert/BigAlert';

export default function ViewTimetableModule() {
  const { retrieverService, storageService } = useContext(ServiceContext);

  const [jsonSolution, setJsonSolution] = useState(null);

  const [selectedOption, setSelectedOption] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);
  const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);

  const [allSections, setAllSections] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [allFaculties, setAllFaculties] = useState([]);
  const [relevantEvents, setRelevantEvents] = useState([]);

  const [days, setDays] = useState(0);
  const [slotsPerDay, setSlotsPerDay] = useState(0);
  const [lunchSlot, setLunchSlot] = useState(0);
  const [lunchSlotSize, setLunchSlotSize] = useState(0);

  const fetchAllResources = async () => {
    const sections = await retrieverService.getAllSections();
    setAllSections(sections);

    const rooms = await retrieverService.getAllRooms();
    setAllRooms(rooms);

    const faculties = await retrieverService.getAllFaculties();
    setAllFaculties(faculties);
  };

  useEffect(() => {
    (async () => {
      const jsonSolutionStringified = await retrieverService.getValue(
        'solution'
      );
      if (!jsonSolutionStringified) return;
      setJsonSolution(JSON.parse(jsonSolutionStringified));

      setDays(parseInt(await retrieverService.getValue('days'), 10));
      setSlotsPerDay(
        parseInt(await retrieverService.getValue('slotsPerDay'), 10)
      );
      setLunchSlot(parseInt(await retrieverService.getValue('lunchSlot'), 10));
      setLunchSlotSize(
        parseInt(await retrieverService.getValue('lunchSlotSize'), 10)
      );
    })();
    fetchAllResources();
  }, []);

  useEffect(() => {
    console.info('JSon solution', jsonSolution);
  }, [jsonSolution]);

  useEffect(() => {
    switch (selectedOption) {
      case 'section':
        setAutoCompleteOptions(
          allSections
            .filter((section) => section.type === 'base')
            .map((section) => section.toString())
        );
        break;

      case 'room':
        setAutoCompleteOptions(allRooms.map((room) => room.roomNo));
        break;

      case 'faculty':
        setAutoCompleteOptions(allFaculties.map((faculty) => faculty.code));
        break;
      default:
        break;
    }
  }, [selectedOption]);

  useEffect(() => {
    if (selectedValue) {
      // setRelevantEvents(
      //   getEventsForBaseSection(selectedSection, allSections, jsonSolution)
      // );
      let events;
      switch (selectedOption) {
        case 'section':
          events = getEventsForBaseSection(
            selectedValue,
            allSections,
            jsonSolution
          );
          setAutoCompleteOptions(
            allSections
              .filter((section) => section.type === 'base')
              .map((section) => section.toString())
          );
          break;

        case 'room':
          events = getEventsForRoom(selectedValue, jsonSolution);
          setAutoCompleteOptions(allRooms.map((room) => room.roomNo));
          break;

        case 'faculty':
          events = getEventForFaculty(selectedValue, jsonSolution);
          setAutoCompleteOptions(allFaculties.map((faculty) => faculty.code));
          break;
        default:
          break;
      }
      setRelevantEvents(events);
    }
  }, [selectedValue]);
  // console.info('Relevant events: ', relevantEvents);

  if (!jsonSolution) {
    return (
      <div className="HorizontallyCentered">
        <BigAlert
          severity="warning"
          message="Please generate timetable to view it"
        />
      </div>
    );
  }

  return (
    <div style={{ margin: '20px' }}>
      <Grid container justify="space-around">
        <Grid item xs="5">
          <FormControl style={{ width: '100%' }}>
            <InputLabel id="demo-simple-select-label">
              Select Resource Type
            </InputLabel>
            <Select
              style={{ width: '100%' }}
              value={selectedOption}
              onChange={(event) => setSelectedOption(event.target.value)}
              placeholder="Select"
            >
              <MenuItem value="section">Section</MenuItem>
              <MenuItem value="room">Room</MenuItem>
              <MenuItem value="faculty">Faculty</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs="5">
          <Autocomplete
            options={autoCompleteOptions}
            style={{ width: '100%' }}
            value={selectedValue}
            onChange={(event, newValue) => setSelectedValue(newValue)}
            disableClearable
            renderInput={(params) => (
              <TextField
                {...params}
                label={`Select ${selectedOption}`}
                variant="outlined"
                placeholder="Type to filter options and then select from list"
              />
            )}
          />
        </Grid>
      </Grid>
      {selectedValue ? (
        <div>
          <br />

          <TimetableGrid
            events={relevantEvents}
            keyToExclude={selectedOption}
            days={days}
            slotsPerDay={slotsPerDay}
            lunchSlot={lunchSlot}
            lunchSlotSize={lunchSlotSize}
          />
        </div>
      ) : (
        <div>
          <br /> <br />
          <Alert severity="info">
            <h1>Please select a Resource</h1>
          </Alert>
        </div>
      )}
    </div>
  );
}
