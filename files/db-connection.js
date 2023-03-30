const sql = require("mssql");
// config for your database

const config = {
    user: 'sa',
    password: 'sa',
    server: 'DESKTOP-IU2JCRE',
    options: {
        instance: 'SQLEXPRESS',
        database: 'MSTeams',
        trustedConnection: true,
        encrypt: false, // change to true for azure   //not necessary
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
};

const sqlConfig = {
    user: 'sa',
    password: 'sa',
    database: 'MSTeams',
    server: 'DESKTOP-IU2JCRE',
    // server: '.',
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
      instance: 'SQLEXPRESS',
      database: 'MSTeams',
      encrypt: false, // change to true for azure
      trustServerCertificate: true // change to true for local dev / self-signed certs
    }
  }

module.exports = { sql, config, sqlConfig };