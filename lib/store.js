var config = require('config');
var _ = require('lodash');

var MongoClient = require('mongodb').MongoClient;

var db;

exports.connect = function connect(callback) {
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

exports.findUser = function findUser(email, callback) {
  var collection = db.collection('users');

  collection.findOne({ email: email }, callback);
};

exports.createUser = function createUser(user, callback) {
  var collection = db.collection('users');

  collection.insert([user], callback);
};

exports.updateUser = function updateUser(user, callback) {
  var collection = db.collection('users');

  collection.update({ email: user.email }, {
    $set: {
      lastUpdated: user.lastUpdated
    }
  }, callback);
};

exports.getEmails = function getEmails(user, callback) {
  var collection = db.collection('emails');

  collection.find({ userId: user.id }).toArray(callback);
};

exports.getEmaiCount = function getEmailCount(user, callback) {
  var collection = db.collection('emails');

  collection.count({ userId: user.id }, callback);
};

exports.saveEmails = function saveEmails(user, emails, callback) {
  var collection = db.collection('emails');
  emails = _.map(emails, function (email) { email.userId = user.id; return email; });

  collection.insert(emails, callback);
};
