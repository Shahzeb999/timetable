import React from 'react';
import { useState, useEffect, useContext } from 'react';

import { Alert, Autocomplete } from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';

import { ServiceContext } from '../../../App';

import KundliModuleInternal from './KundliModuleInternal';

export default function KundliModule() {
  const { retrieverService, storageService } = useContext(ServiceContext);

  const [selectedSection, setSelectedSection] = useState('');
  const [allSections, setAllSections] = useState([]);

  const fetchAllSections = async () => {
    const sections = await retrieverService.getAllSections();
    setAllSections(sections);
  };
  useEffect(() => {
    fetchAllSections();
  }, []);

  return (
    <div className="HorizontallyCentered">
      <Autocomplete
        options={allSections.map((section) => section.toString())}
        style={{ width: '50%' }}
        value={selectedSection}
        onChange={(event, newValue) => setSelectedSection(newValue)}
        disableClearable
        renderInput={(params) => (
          <TextField
            {...params}
            label="Please select a section"
            variant="outlined"
            placeholder="Type to filter options and then select from list"
          />
        )}
      />
      {selectedSection.length > 0 ? (
        <KundliModuleInternal selectedSectionString={selectedSection} />
      ) : (
        <div>
          <br /> <br />
          <Alert severity="info">
            <h1>Please select a section</h1>
          </Alert>
        </div>
      )}
    </div>
  );
}
