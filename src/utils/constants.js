const path = require('path');

// Page paths
export const PATHS = {
  projectDashboard: '/',
  homePage: '/2',
};

export const DATABASE_DIRECTORY = path.join(__dirname, '../data');
export const JSON_DIRECTORY = path.join(__dirname, '../json');
export const ENGINE_FILE_PATH = path.join(__dirname, '../../TTGOSA.exe');

// SQL Errors
export const SQL_ERRORS = {
  uniqueConstraint: 19,
};

// CSS
export const CSS = {
  themeColor: {
    background:
      'linear-gradient(90deg, rgba(3, 0, 51, 1) 0%, rgba(77, 50, 112, 1) 33%, rgba(14, 168, 102, 1) 100%',
    height: '100px',
    display: 'flex',
    justifyContent: 'center',
  },

  insertForm: {
    border: '3px black solid',
    padding: '2%',
    margin: '2%',
    boxShadow: '5px 5px 10px grey',
  },

  greenButton: {
    backgroundColor: 'green',
    color: 'white',
  },

  redButton: {
    backgroundColor: 'red',
    color: 'white',
  },

  inputFormField: {
    margin: '8px',
  },
};
