import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles({
  alert: {
    '& .MuiAlert-icon': {
      fontSize: 35,
    },
  },
});

export default function BigAlert(props) {
  const classes = useStyles();

  const { severity, message } = props;

  const splittedMessage = message.split('\n');

  const getParagraphs = (lines) => {
    return (
      <div>
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    );
  };
  return (
    <div>
      <Alert
        severity={severity}
        className={classes.alert}
        style={{ width: '100%' }}
      >
        <div style={{ fontSize: 25 }}>{getParagraphs(splittedMessage)}</div>
      </Alert>
    </div>
  );
}
