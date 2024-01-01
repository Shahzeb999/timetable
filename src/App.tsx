import React, { useEffect } from 'react';
import { Switch, Route, useHistory, HashRouter } from 'react-router-dom';
import './App.global.css';

import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Button } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import AssignmentIcon from '@material-ui/icons/Assignment';
import AddCircleIcon from '@material-ui/icons/AddCircle';

import Dao from './services/dao';
import RetrieverService from './services/retrieverService';
import StorageService from './services/storageService';

import * as constants from './utils/constants';

import HomePage from './pages/HomePage';

import ErrorDialog from './components/ErrorDialog';
import NewProjectDialog from './components/NewProjectDialog/NewProjectDialog';

const fs = require('fs');

export const ServiceContext = React.createContext();

const useStyles = makeStyles(() => ({
  root: {
    height: 'auto',
  },
  list: {
    minWidth: '300px',
    maxWidth: '1400px',
    height: '50vh',
    margin: '5%',
    overflow: 'auto',
    backgroundColor: 'RGB(0, 0, 0, .2)',
    boxShadow: '1px 3px 10px black',
  },
  addProjectButton: {
    backgroundColor: 'RGB(255, 255, 255, 0.3)',
    color: 'black',
    boxShadow: '1px 3px 10px grey',
    height: '10vh',
    maxWidth: '400px',
  },
}));

let dao: Dao;
let retrieverService: RetrieverService;
let storageService: StorageService;
const services = { storageService: {}, retrieverService: {} };

const Hello = () => {
  const [showError, setShowError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [projectNames, setProjectNames] = React.useState([]);
  const [showNewProjectDialog, setShowNewProjectDialog] = React.useState(false);
  const [newProjectName, setNewProjectName] = React.useState('');

  const classes = useStyles();
  const history = useHistory();

  useEffect(() => {
    if (!fs.existsSync(constants.DATABASE_DIRECTORY)) {
      fs.mkdirSync(constants.DATABASE_DIRECTORY);
    }
    setProjectNames(fs.readdirSync(constants.DATABASE_DIRECTORY));
  }, []);

  const handleNewProject = () => {
    setShowNewProjectDialog(true);
  };

  const openProject = async (projectName) => {
    /** Actually create the new project on disk
     * Probably make a funciton to create a new project in DAO or something
     */

    dao = new Dao(projectName);
    retrieverService = new RetrieverService(dao);
    storageService = new StorageService(dao);

    services.storageService = storageService;
    services.retrieverService = retrieverService;

    setShowNewProjectDialog(false);
    setNewProjectName('');

    await storageService.createAllTables();
    history.push(constants.PATHS.homePage);
  };

  return (
    <div className={classes.root}>
      {/* Error message dialog that is shown occasionally on any errors */}
      <ErrorDialog
        showError={showError}
        setShowError={setShowError}
        message={errorMessage}
      />
      {/* New project dialog that appears on clicking new project */}
      <NewProjectDialog
        showNewProjectDialog={showNewProjectDialog}
        setShowNewProjectDialog={setShowNewProjectDialog}
        newProjectName={newProjectName}
        setNewProjectName={setNewProjectName}
        openProject={openProject}
      />
      {/* Main content of the page */}
      <AppBar position="fixed" style={constants.CSS.themeColor}>
        <Toolbar>
          <Typography variant="h2" noWrap>
            Select Project
          </Typography>
        </Toolbar>
      </AppBar>
      <br /> <br />
      <br /> <br />
      <br /> <br />
      <br /> <br />
      <div className="HorizontallyCentered">
        {/* Button to add a new project */}
        <Button className={classes.addProjectButton} onClick={handleNewProject}>
          <AddCircleIcon fontSize="large" />
          New Project
        </Button>
      </div>
      {/* List of project databases */}
      <div className="HorizontallyCentered">
        <List className={classes.list}>
          {projectNames.map((databaseName) => (
            <ListItem
              button
              key={databaseName}
              onClick={() => openProject(databaseName)}
            >
              <ListItemIcon>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary={databaseName} />
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ServiceContext.Provider value={services}>
      <HashRouter>
        <Switch>
          <Route path={constants.PATHS.homePage} component={HomePage} />
          <Route path={constants.PATHS.projectDashboard} component={Hello} />
        </Switch>
      </HashRouter>
    </ServiceContext.Provider>
  );
}
