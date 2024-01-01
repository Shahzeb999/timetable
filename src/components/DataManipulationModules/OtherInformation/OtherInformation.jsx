import React, { useState, useContext, useEffect } from 'react';

import { ServiceContext } from '../../../App';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { Alert } from '@material-ui/lab';

const textFieldStyle = {
  width: '50%',
  margin: '10px',
};

export default function OtherInformation() {
  const { retrieverService, storageService } = useContext(ServiceContext);

  const [days, setDays] = useState(6);
  const [slotsPerDay, setSlotsPerDay] = useState(8);
  const [lunchSlot, setLunchSlot] = useState(5);
  const [lunchSlotSize, setLunchSlotSize] = useState(1);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    (async () => {
      setDays(parseInt(await retrieverService.getValue('days'), 10));
      setSlotsPerDay(
        parseInt(await retrieverService.getValue('slotsPerDay'), 10)
      );
      setLunchSlot(parseInt(await retrieverService.getValue('lunchSlot'), 10));
      setLunchSlotSize(
        parseInt(await retrieverService.getValue('lunchSlotSize'), 10)
      );
    })();
  }, []);

  const validate = () => {
    if (slotsPerDay > 11) {
      setErrorMessage('Slots Per Day cannot be more than 11');
      return false;
    }

    if (!slotsPerDay && lunchSlot) {
      setErrorMessage('Please enter Slots Per Day');
      return false;
    }

    if (lunchSlot + lunchSlotSize - 1 > slotsPerDay) {
      setErrorMessage(
        'Invalid Lunch Slot: Please select a lower lunch slot or decrese lunch slot size'
      );
      return false;
    }

    if (lunchSlot && lunchSlot > 0 && !lunchSlotSize) {
      setErrorMessage('Please enter Lunch Slot Size');
      return false;
    }

    if (lunchSlotSize && lunchSlot !== 0 && !lunchSlot) {
      setErrorMessage('Please enter Lunch Slot');
      return false;
    }

    return true;
  };

  const updateInformation = async () => {
    if (!validate()) {
      setSuccessMessage('');
      return;
    }

    try {
      await storageService.saveKeyValue('days', days);
      await storageService.saveKeyValue('slotsPerDay', slotsPerDay);
      await storageService.saveKeyValue('lunchSlot', lunchSlot);
      await storageService.saveKeyValue('lunchSlotSize', lunchSlotSize);
    } catch (err) {
      setErrorMessage(err.message);
    }
    setErrorMessage('');
    setSuccessMessage('Successfully saved');
  };

  return (
    <div
      style={{ width: '100%', padding: '2% 5% 0% 5%' }}
      className="HorizontallyCentered"
    >
      <TextField
        style={textFieldStyle}
        value={days}
        onChange={(e) => setDays(Math.max(e.target.value, 1))}
        label="Days"
        type="number"
      />
      <TextField
        style={textFieldStyle}
        value={slotsPerDay}
        onChange={(e) => setSlotsPerDay(Math.max(e.target.value, 1))}
        label="Slots Per Day"
        type="number"
      />
      <TextField
        style={textFieldStyle}
        value={lunchSlot}
        onChange={(e) => setLunchSlot(Math.max(e.target.value, 0))}
        label="Lunch Slot (Put 0 for no lunch slot)"
        type="number"
      />
      <TextField
        style={textFieldStyle}
        value={lunchSlotSize}
        disabled={!lunchSlot}
        onChange={(e) => setLunchSlotSize(Math.max(e.target.value, 1))}
        label="Lunch Slot Size"
        type="number"
      />

      {errorMessage.length > 0 && (
        <Alert severity="error" style={textFieldStyle}>
          {errorMessage}
        </Alert>
      )}

      {successMessage.length > 0 && (
        <Alert severity="success" style={textFieldStyle}>
          {successMessage}
        </Alert>
      )}

      <Button onClick={updateInformation} variant="contained" color="primary">
        Save
      </Button>
    </div>
  );
}
