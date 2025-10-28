let mysql = require('mysql');
require('dotenv').config({ quiet: true });

class Database {
  constructor(testing = false) {
    this.testing = testing;
    this.connection = null;
  }

  async connect() {
    const mysql = require('mysql');
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
}


module.exports = Database;