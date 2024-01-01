import React from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

export default (props) => {
  const {
    showNewProjectDialog,
    setShowNewProjectDialog,
    newProjectName,
    setNewProjectName,
    openProject,
  } = props;

  return (
    <Dialog open={showNewProjectDialog}>
      <DialogTitle id="form-dialog-title">Create a New Project</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <b>Please enter the name of the project </b>
          <br />
          Name should be short and descriptive
        </DialogContentText>
        <TextField
          autoFocus
          value={newProjectName}
          onChange={(event) => setNewProjectName(event.target.value)}
          margin="dense"
          id="name"
          label="Proejct Name"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setShowNewProjectDialog(false)}
          color="secondary"
        >
          Cancel
        </Button>
        <Button onClick={() => openProject(newProjectName)} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
