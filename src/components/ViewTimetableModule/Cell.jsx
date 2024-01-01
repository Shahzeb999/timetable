import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Grid } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  subdiv: {
    padding: '5px',
    textAlign: 'center',
    height: '100%',
    fontSize: '12px',
    borderBottom: '1px black solid',
  },
}));

export default function Cell(props) {
  const { borderless, bottomBorder, rows, width } = props;
  const classes = useStyles();

  if (borderless && bottomBorder) {
    return <Grid item xs={width} style={{ borderBottom: '1px solid black' }} />;
  }

  if (borderless || rows === null) {
    return <Grid item xs={width} />;
  }

  const getProcessedRow = (row) => {
    let totalSlotsRequiredInRow;
    try {
      totalSlotsRequiredInRow = row.reduce(
        (sum, cell) => sum + cell.slotSize,
        0
      );
    } catch (err) {
      console.warn('Got error in row', row);
    }

    return (
      <Grid
        item
        container
        direction="row"
        justify="space-between"
        alignItems="stretch"
        style={{
          width: '100%',
          margin: '0px',
          padding: '0px',
          height: `${Math.floor(100 / rows.length)}%`,
        }}
      >
        {row.map((cell, i) => (
          <Grid
            item
            key={cell.content}
            xs={(cell.slotSize * 12) / totalSlotsRequiredInRow}
            style={{ borderRight: '1px black solid', height: '100%' }}
          >
            <div className={classes.subdiv}>{cell.content}</div>
          </Grid>
        ))}
      </Grid>
    );
  };

  const rowsWithEverySecondElementAsDummyForHorizontalLine = [];
  // rows.forEach((row) => {
  //   rowsWithEverySecondElementAsDummyForHorizontalLine.push(row);
  //   rowsWithEverySecondElementAsDummyForHorizontalLine.push('');
  // });
  // rowsWithEverySecondElementAsDummyForHorizontalLine.pop();

  return (
    <Grid item xs={width}>
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="stretch"
        style={{
          border: '1px solid black',
          height: '100%',
          padding: '0px',
          margin: '0px',
        }}
      >
        {rows.map((row) => {
          // if (i % 2 === 1) {
          //   return (
          //     <Grid item>
          //       <hr style={{ margin: '0px', padding: '0px' }} />
          //     </Grid>
          //   );
          // }
          return getProcessedRow(row);
        })}
      </Grid>
    </Grid>
  );
}
