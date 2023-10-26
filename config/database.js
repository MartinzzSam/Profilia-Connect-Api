const mongoose = require("mongoose");

const dbConnection = () => {
  // Conntect With Database
  mongoose.connect(process.env.DB_URI).then((conn) => {
    console.log(conn.connection.host);
  });
};

module.exports = dbConnection;
