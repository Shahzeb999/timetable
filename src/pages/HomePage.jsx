/* eslint-disable no-console */
import React from 'react';

import './../App.global.css';

import Button from '@material-ui/core/Button';

import { ServiceContext } from '../App';
import * as constants from '../utils/constants';

import Drawer from '../components/Drawer/Drawer';

import RoomsModule from '../components/DataManipulationModules/RoomsModule/RoomsModule';
import SubjectsModule from '../components/DataManipulationModules/SubjectsModule/SubjectsModule';
import FacultyModule from '../components/DataManipulationModules/FacultyModule/FacultyModule';
import SectionsModule from '../components/DataManipulationModules/SectionsModule/SectionsModule';
import KundliModule from '../components/DataManipulationModules/KundliModule/KundliModule';
import GenerateTimeTableModule from '../components/GenerateTimeTableModule/GenerateTimeTableModule';
import ViewTimetableModule from '../components/ViewTimetableModule/ViewTimetableModule';
import OtherInformation from '../components/DataManipulationModules/OtherInformation/OtherInformation';
import BusySectionConstraintModule from '../components/DataManipulationModules/BusySectionConstraintModule/BusySectionConstraintModule';
import BusyFacultyConstraintModule from '../components/DataManipulationModules/BusyFacultyConstraintModule/BusyFacultyConstraintModule';

const ROOMS = 'Rooms';
const SUBJECTS = 'Subjects';
const FACULTY = 'Faculty';
const SECTIONS = 'Sections';
const KUNDLI = 'Kundli';
const OTHER = 'Other Information';

const BUSY_SECTION_CONSTRAINT = 'Busy Section Constraint';
const BUSY_FACULTY_CONSTRAINT = 'Busy Faculty Constraint';

const GENERATE_TIMETABLE = 'Generate Timetable';
const VIEW_TIMETABLE = 'View Timetable';

const DEFAULT_OPTION = ROOMS;

const HomePage = () => {
  const services = React.useContext(ServiceContext);

  /* The option selected in the Drawer */
  const [selectedOption, setSelectedOption] = React.useState(DEFAULT_OPTION);
  console.info('Selected option: ', selectedOption);

  const optionLists = [
    [
      {
        text: ROOMS,
        onClick: () => setSelectedOption(ROOMS),
      },
      {
        text: SUBJECTS,
        onClick: () => setSelectedOption(SUBJECTS),
      },
      {
        text: FACULTY,
        onClick: () => setSelectedOption(FACULTY),
      },
      {
        text: SECTIONS,
        onClick: () => setSelectedOption(SECTIONS),
      },
      {
        text: KUNDLI,
        onClick: () => setSelectedOption(KUNDLI),
      },
      {
        text: OTHER,
        onClick: () => setSelectedOption(OTHER),
      },
      {
        text: BUSY_SECTION_CONSTRAINT,
        onClick: () => setSelectedOption(BUSY_SECTION_CONSTRAINT),
      },
      {
        text: BUSY_FACULTY_CONSTRAINT,
        onClick: () => setSelectedOption(BUSY_FACULTY_CONSTRAINT),
      },
    ],
    [
      {
        text: GENERATE_TIMETABLE,
        onClick: () => setSelectedOption(GENERATE_TIMETABLE),
      },
      {
        text: VIEW_TIMETABLE,
        onClick: () => setSelectedOption(VIEW_TIMETABLE),
      },
    ],
  ];
  const optionListTitles = ['Input Information', 'Timetabling'];
  const optionListTitlesBackgroundColor = ['#a13e2f', '#082f66'];

  const getSelectedModule = () => {
    switch (selectedOption) {
      case ROOMS:
        return <RoomsModule />;
      case SUBJECTS:
        return <SubjectsModule />;
      case FACULTY:
        return <FacultyModule />;
      case SECTIONS:
        return <SectionsModule />;
      case KUNDLI:
        return <KundliModule />;
      case OTHER:
        return <OtherInformation />;
      case BUSY_SECTION_CONSTRAINT:
        return <BusySectionConstraintModule />;
      case BUSY_FACULTY_CONSTRAINT:
        return <BusyFacultyConstraintModule />;
      case GENERATE_TIMETABLE:
        return <GenerateTimeTableModule />;
      case VIEW_TIMETABLE:
        return <ViewTimetableModule />;
      default:
        return <h1>How did you get here?</h1>;
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <Drawer
        optionLists={optionLists}
        optionListTitles={optionListTitles}
        titleText={selectedOption}
        optionListTitlesBackgroundColor={optionListTitlesBackgroundColor}
      />
      {getSelectedModule()}
    </div>
  );
};

export default HomePage;
