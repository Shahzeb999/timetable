import { DATABASE_DIRECTORY } from '../utils/constants';

/* eslint-disable no-console */
const sqlite3 = require('sqlite3');
const path = require('path');
const fileSystem = require('fs');
const Promise = require('bluebird');

class Dao {
  constructor(dbName) {
    // Path on which we want our database to be created
    const dirPath = DATABASE_DIRECTORY;

    // If path doesn't exist, create it
    if (!fileSystem.existsSync(dirPath)) {
      fileSystem.mkdirSync(dirPath);
    }

    // Get the path of the actual database i.e., path + database name
    const dbPath = path.resolve(dirPath, dbName);

    // Connect to the database
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.info('Error while opening database file', err);
        throw new Error("Couldn't open the project file. It may be corrupted!");
      } else console.info(`Dao connected to database: ${dbName}`);
    });
  }

  run(sql, params = []) {
    console.log('Executing', sql, params);

    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.log(`Error running sql ${sql}`);
          console.log(err);
          reject(err);
        } else {
          console.log('Executed without error', sql, params);
          resolve({ id: this.lastID });
        }
      });
    });
  }

  get(sql, params = []) {
    console.log('Executing', sql, params);

    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          console.log('Error running sql: ' + sql);
          console.log(err);
          reject(err);
        } else {
          console.log('Result of', sql, params, result);
          resolve(result);
        }
      });
    });
  }
  // async get(sql, params = []) {
  //   console.log('Executing', sql, params);
  //   const result = await this.db.get(sql, params);
  //   console.log('IN dao result = ', result);
  //   return result;
  // }

  all(sql, params = []) {
    console.log('Executing', sql, params);

    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.log('Error running sql: ' + sql);
          console.log(err);
          reject(err);
        } else {
          console.log('Result of', sql, params, rows);
          resolve(rows);
        }
      });
    });
  }
}

export default Dao;
