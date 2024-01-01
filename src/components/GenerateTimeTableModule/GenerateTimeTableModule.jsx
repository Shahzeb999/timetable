import React, { useState, useContext } from 'react';

import { Button } from '@material-ui/core';

import { ServiceContext } from '../../App';

import BigAlert from '../BigAlert/BigAlert';

import { CSS } from '../../utils/constants';
import EngineBridgeService from '../../services/engineBridgeService';

export default function GenerateTimeTableModule() {
  const { retrieverService, storageService } = useContext(ServiceContext);

  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [alreadyGenerated, setAlreadyGenerated] = useState(false);

  const setStatusMessageAndType = (
    statusMessageToBeShown,
    messageTypeOfShownMessage
  ) => {
    setStatusMessage(statusMessageToBeShown);
    setMessageType(messageTypeOfShownMessage);
  };

  const generateTimetable = (forceOverwrite) => {
    const engineBridgeService = new EngineBridgeService(
      retrieverService,
      storageService
    );
    engineBridgeService.generateTimetable(
      setStatusMessageAndType,
      setAlreadyGenerated,
      forceOverwrite
    );
  };

  return (
    <div
      style={{ width: '100%', padding: '2% 5% 0% 5%' }}
      className="HorizontallyCentered"
    >
      <Button
        variant="outlined"
        onClick={() => generateTimetable(false)}
        style={CSS.greenButton}
      >
        Generate Timetable
      </Button>
      <br /> <br />
      <BigAlert severity={messageType} message={statusMessage} />
      <br /> <br />
      {alreadyGenerated && (
        <Button
          variant="outlined"
          style={CSS.redButton}
          onClick={() => {
            generateTimetable(true);
            setAlreadyGenerated(false);
          }}
        >
          Force Overwrite
        </Button>
      )}
    </div>
  );
}
