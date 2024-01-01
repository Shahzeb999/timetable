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
import MyTooltip from '../../MyTooltip/MyTooltip';

const tableColumns = [
  utilityFunctions.getColumnObjectForDataTable('letter', 'Section Letter', 0.2),
  utilityFunctions.getColumnObjectForDataTable('branch', 'Branch', 0.2),
  utilityFunctions.getColumnObjectForDataTable('year', 'Year', 0.2),
  utilityFunctions.getColumnObjectForDataTable(
    'parentSections',
    'Conflicting Sections',
    0.8,
    'Sections that can not be busy at the same time as this section'
  ),
];

export default function SectionsModule() {
  const { retrieverService, storageService } = useContext(ServiceContext);

  const [allSections, setAllSections] = useState([]);

  const [letter, setLetter] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [batchesCount, setBatchesCount] = useState(0);
  /** ParentSections only stores a list of sections.toString() strings */
  const [parentSections, setParentSections] = useState([]);

  const [isElective, setIsElective] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchAllSections();
  }, []);

  useEffect(() => {
    if (successMessage.length > 0) setErrorMessage('');
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage.length > 0) setSuccessMessage('');
  }, [errorMessage]);

  const fetchAllSections = async () => {
    const sections = await retrieverService.getAllSections();
    console.info('All sections', sections);
    setAllSections(sections);
  };

  const validateInput = () => {
    if (!utilityFunctions.blankCheck(letter)) {
      setErrorMessage("Section letter can't be blank");
      return false;
    }
    if (letter.includes(',')) {
      setErrorMessage("Section letter can't contain any commas");
      return false;
    }
    if (letter.includes(' ')) {
      setErrorMessage("Section letter can't contain blank spaces");
      return false;
    }
    if (branch.includes(',')) {
      setErrorMessage("Section branch can't contain any commas");
      return false;
    }
    if (branch.includes(' ')) {
      setErrorMessage("Branch name can't contain blank spaces");
      return false;
    }
    if (year.includes(',')) {
      setErrorMessage("Section year can't contain any commas");
      return false;
    }
    if (year.includes(' ')) {
      setErrorMessage("Year can't contain blank spaces");
      return false;
    }
    if (isElective && parentSections.length < 2) {
      setErrorMessage('Please select at least 2 conflicting scections');
      return false;
    }
    return true;
  };

  const clearInput = () => {
    setLetter('');
    setBranch('');
    setYear('');
    setBatchesCount(0);
    setParentSections([]);
  };

  const insertSingle = async (letter, branch, year, type, parentSections) => {
    try {
      await storageService.saveSection({
        letter,
        branch,
        year,
        type,
        parentSections,
      });
    } catch (err) {
      if (err.errno === SQL_ERRORS.uniqueConstraint) {
        setErrorMessage(
          `A section is already present named ${letter} ${branch} Year-${year}`
        );
      } else {
        setErrorMessage(`Unknown error: ${err.message}`);
      }
      return false;
    }
    return true;
  };

  const insert = async () => {
    console.info('Inserting for ', letter, branch, year, parentSections);

    if (!validateInput()) return false;

    // Base section
    if (!isElective) {
      // Insert the base section
      if (!(await insertSingle(letter, branch, year, 'base', []))) return false;
    } else if (
      !(await insertSingle(
        letter,
        branch,
        year,
        'elective',
        parentSections.map((section) =>
          utilityFunctions.sectionStringToSection(section)
        )
      ))
    )
      return false;

    // Insert batches if exist
    const type = isElective ? 'elective batch' : 'batch';
    if (batchesCount > 0) {
      for (let i = 0; i < batchesCount; i += 1) {
        if (
          // eslint-disable-next-line no-await-in-loop
          !(await insertSingle(`${letter}${i + 1}`, branch, year, type, [
            { letter, branch, year },
          ]))
        )
          return false;
      }
    }
    // Elective Section

    setSuccessMessage(
      `Successfully inserted Section ${letter} ${branch} Year-${year}`
    );

    // Update the data according to the new insertion
    fetchAllSections();

    return true;
  };

  const deleteFunction = async (uniqueId) => {
    const [letter, branch, year] = uniqueId.split(',');
    await storageService.deleteSection({ letter, branch, year });
  };

  const afterDeletion = async () => {
    await fetchAllSections();
  };

  const getInputForm = () => {
    return (
      <div>
        <div
          style={{
            textAlign: 'left',
          }}
        >
          <Switch
            checked={isElective}
            onChange={(e) => setIsElective(e.target.checked)}
          />
          Elective section
        </div>
        <TextField
          style={CSS.inputFormField}
          label="Section Letter"
          variant="outlined"
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
          size="small"
        />
        <Autocomplete
          size="small"
          style={CSS.inputFormField}
          freeSolo
          inputValue={branch}
          onInputChange={(event, newValue) => {
            setBranch(newValue);
          }}
          options={allSections.reduce((options, section) => {
            if (!options.includes(section.branch) && section.branch.length > 0)
              options.push(section.branch);
            return options;
          }, [])}
          renderInput={(params) => (
            <TextField {...params} label="Branch" variant="outlined" />
          )}
        />

        <TextField
          style={CSS.inputFormField}
          label="Year"
          variant="outlined"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          size="small"
        />
        <TextField
          style={CSS.inputFormField}
          label="No. of Batches"
          variant="outlined"
          value={batchesCount}
          type="number"
          onChange={(e) => setBatchesCount(Math.max(0, e.target.value))}
          size="small"
        />
        {isElective && (
          <div style={CSS.inputFormField}>
            <MyTooltip title="Select sections that can't be busy at the same time as this section">
              <MultiSelectAutoComplete
                options={allSections.map((section) => section.toString())}
                label="Conflicting Sections"
                size="small"
                values={parentSections}
                setValues={setParentSections}
                freeSolo={false}
                placeholder="Choose multiple options from the dropdown"
              />
            </MyTooltip>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{}} className="HorizontallyCentered">
      <GeneralModule
        entityName="Section"
        errorMessage={errorMessage}
        successMessage={successMessage}
        tableColumns={tableColumns}
        tableRows={allSections}
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
