var MongoClient = require('mongodb').MongoClient;
var config = require('config');
var db;

var connect = function connect(callback) {
  MongoClient.connect(config.mongoUrl, function (err, database) {
    if (err) {
      throw err;
    }
    console.log("Successfully connected to MongoDB: ", config.mongoUrl);

    db = database;
    if (callback) {
      return callback();
    }
  });
};
exports.connect = connect;

/* --- USERS AND AUTHORIZATION --- */
exports.getOrCreateUser = function (user, callback) {
  var collection = db.collection('users');

  collection.update({
      email: user.email
    }, {
      $set: {
        email: user.email,
        id: user.id
      }
    }, {
      upsert: true,
    },
    function (err, result) {
      return callback(err, result);
    }
  );
};
