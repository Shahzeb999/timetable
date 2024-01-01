import React, { useState, useEffect, useContext } from 'react';

import { ServiceContext } from '../../App';

import { Grid } from '@material-ui/core';
import { Slider } from '@material-ui/core';
import Cell from './Cell';
import { getEventGridFromEvents } from '../../utils/viewTimetableUtils';

const heightMultiplier = 20;

export default function TimetableGrid(props) {
  const { retrieverService, storageService } = useContext(ServiceContext);

  const { events, keyToExclude, days, slotsPerDay, lunchSlot, lunchSlotSize } =
    props;

  const [height, setHeight] = useState(15);

  // useEffect(() => {
  //   (async () => {
  //     const days = parseInt(await retrieverService.getValue('days'), 10);
  //     const slotsPerDay = parseInt(
  //       await retrieverService.getValue('slotsPerDay'),
  //       10
  //     );
  //     const lunchSlot = parseInt(
  //       await retrieverService.getValue('lunchSlot'),
  //       10
  //     );
  //     setEventGrid(
  //       getEventGridFromEvents(events, 'section', days, slotsPerDay, lunchSlot)
  //     );
  //   })();
  // }, []);

  // (async () => {
  //   const days = parseInt(await retrieverService.getValue('days'), 10);
  //   const slotsPerDay = parseInt(
  //     await retrieverService.getValue('slotsPerDay'),
  //     10
  //   );
  //   const lunchSlot = parseInt(
  //     await retrieverService.getValue('lunchSlot'),
  //     10
  //   );
  //   eventGrid = getEventGridFromEvents(
  //     events,
  //     'section',
  //     days,
  //     slotsPerDay,
  //     lunchSlot
  //   );
  // })()

  const eventGrid = getEventGridFromEvents(
    events,
    keyToExclude,
    days,
    slotsPerDay,
    lunchSlot,
    lunchSlotSize
  );

  // console.log('eventGrid:', eventGrid);

  const handleHeightChange = (event, newValue) => {
    setHeight(newValue);
  };

  return (
    <div>
      <Grid
        container
        xs={6}
        style={{ border: '2px solid grey', margin: '15px 15px 15px 0px' }}
      >
        <Grid item xs={5} style={{ textAlign: 'center' }}>
          Adjust Timetable height
        </Grid>
        <Grid item xs={6}>
          <Slider value={height} onChange={handleHeightChange} />{' '}
        </Grid>
      </Grid>

      <Grid
        container
        spacing={0}
        style={{
          height: `${height * heightMultiplier}px`,
        }}
      >
        {eventGrid.map((row, i) =>
          row.map((cell, j) => {
            if (cell)
              return <Cell width={cell.slotsRequired} rows={cell.events} />;
            // if (i === days && j < slotsPerDay - 1)
            //   return <Cell borderless bottomBorder width={1} />;
            return <Cell borderless width={1} />;
          })
        )}
      </Grid>
    </div>
  );
}
