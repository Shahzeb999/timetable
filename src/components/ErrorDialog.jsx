import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles((theme) => ({
  dialog: {
    color: 'white',
    fontSize: '30px',
  },
  title: {
    color: 'red',
    backgroundColor: 'pink',
    border: 'solid red 2px',
  },
  titleText: {
    fontSize: '30px',
  },
  content: {
    borderColor: 'red',
    borderStyle: 'solid',
    borderWidth: '0px 2px 0px 2px',
  },
  actions: {
    borderColor: 'red',
    borderStyle: 'solid',
    borderWidth: '0px 2px 2px 2px',
  },
  button: {
    border: 'solid red 1px',
  },
}));

export default function ErrorDialog(props) {
  const { showError, setShowError, message } = props;

  const classes = useStyles();

  const handleClose = () => {
    setShowError(false);
    setShowError(false);
  };
  return (
    <Dialog
      className={classes.dialog}
      open={showError}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle className={classes.title} id="alert-dialog-title">
        <div className={classes.titleText}>Error</div>
      </DialogTitle>
      <DialogContent className={`${classes.content}`}>
        <DialogContentText id="alert-dialog-description">
          <div>{message}</div>
        </DialogContentText>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button
          onClick={handleClose}
          className={classes.button}
          color="primary"
          autoFocus
        >
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// export default withStyles(styles)(ErrorDialog);
// export default ErrorDialog;
