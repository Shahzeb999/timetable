import {
  Button,
  Grid,
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  TextField,
} from '@material-ui/core';
import React, { useState } from 'react';

import { CSS } from '../../utils/constants';

export default function TimeSlotsInput(props) {
  const { timeSlots, setTimeSlots } = props;

  const [day, setDay] = useState(1);
  const [slot, setSlot] = useState(1);

  const addTimeSlot = () => {
    if (
      !timeSlots.find((timeSlot) => timeSlot[0] === day && timeSlot[1] === slot)
    ) {
      setTimeSlots([...timeSlots, [day, slot]]);
      // setDay(1);
      // setSlot(1);
    }
  };

  return (
    <div>
      <Grid container>
        <Grid item>
          <TextField
            style={CSS.inputFormField}
            label="Day"
            variant="outlined"
            size="small"
            value={day}
            type="number"
            onChange={(e) => setDay(Math.max(e.target.value, 1))}
          />
        </Grid>
        <Grid item>
          <TextField
            style={CSS.inputFormField}
            label="Slot"
            variant="outlined"
            size="small"
            value={slot}
            type="number"
            onChange={(e) => setSlot(Math.max(e.target.value, 1))}
          />
        </Grid>
        <Button variant="contained" color="primary" onClick={addTimeSlot}>
          Add
        </Button>
      </Grid>
      {timeSlots.length > 0 && (
        <Table>
          <TableHead>
            <TableCell>Day</TableCell>
            <TableCell>Slot</TableCell>
          </TableHead>
          <TableBody>
            {timeSlots.map((timeSlot) => (
              <TableRow key={Math.random()}>
                <TableCell>{timeSlot[0]}</TableCell>
                <TableCell>{timeSlot[1]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
