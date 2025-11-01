let mysql = require('mysql');
require('dotenv').config({ quiet: true });

class Database {
  constructor(testing = false) {
    this.testing = testing;
    this.connection = null;
    this.usersTable = "Users"


    this.defaultTable = this.usersTable
  }

  async connect() {
    const mysql = require('mysql');
    if (!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_USER || !process.env.DB_PASS){
      console.log("No .env file detected, will not connect to database")
    }
    this.connection = mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: this.testing ? process.env.TEST_DB_NAME : process.env.DB_NAME
    });

    return new Promise((resolve, reject) => {
      this.connection.connect((err) => {
        if (err) {
          this.connection = null;
          console.log("error connecting")
          return reject(err);
        }
        resolve();
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.connection) {
        this.connection.end((err) => {
          if (err) return reject(err);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async dropSafety(){
    return new Promise((resolve, reject) => {
      this.connection.query('SET SQL_SAFE_UPDATES = 0', (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  async raiseSafety(){
    return new Promise((resolve, reject) => {
      this.connection.query('SET SQL_SAFE_UPDATES = 1', (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  // used for write only
  async submitQuery(query, params, bypassNoResult = false){
    console.log(`TESTING: ${this.testing} | executing: ${mysql.format(query, params)}`)

    return new Promise((resolve, reject) => {
      this.connection.query(query, params, (err, results) => {
        if (err) return reject({statusCode: 400, message: `Database query error: ${err.sqlMessage}`});
        // insertId is only 0 when truncate is ran
        // truncate causes affectedRows to equal 0
        if (results.affectedRows === 0 && !bypassNoResult) return reject({statusCode: 404, message: `No rows updated`});
        resolve(results)
      })
    })
  }

  // used for read only
  async fetchQuery(query, params){
    console.log(`TESTING: ${this.testing} | executing: ${mysql.format(query, params)}`)

    return new Promise((resolve, reject) => {
      this.connection.query(query, params, (err, results) => {
        if (err) return reject({statusCode: 400, message: `Database query error: ${err.sqlMessage}`});
        if (results.length === 0) return reject({statusCode: 404, message: `No objects found`});
        resolve(results)
      })
    })
  }
}


module.exports = Database;