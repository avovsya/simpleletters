var MongoClient = require('mongodb').MongoClient;
var config = require('config');
var db;

MongoClient.connect(config.mongoUrl, function (err, database) {
  if (err) {
    throw err;
  }
  console.log("Successfully connected to MongoDB: ", config.mongoUrl);

  db = database;
});

