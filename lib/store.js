var _ = require('lodash');

var MongoClient = require('mongodb').MongoClient;
var mongoUrl = process.env.MONGO_URL;

var db;

exports.connect = function connect(callback) {
  MongoClient.connect(mongoUrl, function (err, database) {
    if (err) {
      throw err;
    }
    console.log("Successfully connected to MongoDB: ", mongoUrl);

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

var updateUser = exports.updateUser = function updateUser(user, callback) {
  var collection = db.collection('users');

  collection.update({ email: user.email }, {
    $set: {
      lastUpdated: user.lastUpdated,
      latestEmail: user.latestEmail
    }
  }, callback);
};

exports.getEmails = function getEmails(user, callback) {
  var collection = db.collection('emails');

  collection.find({ userId: user.id, unread: true }, { sort: [['date', 'descending']] }).toArray(callback);
};

exports.getEmaiCount = function getEmailCount(user, callback) {
  var collection = db.collection('emails');

  collection.count({ userId: user.id, unread: true}, callback);
};

exports.saveEmails = function saveEmails(user, emails, callback) {
  var collection = db.collection('emails');
  emails = _.map(emails, function (email) { email.userId = user.id; return email; });

  if (emails.length === 0) {
    return callback();
  }

  user.lastUpdated = new Date().getTime();

  collection.insert(emails, { continueOnError: true }, function (err, res) {
    // Ignore Duplicate key errors
    if (err && err.code !== 11000) {
      return callback(err);
    }
    updateUser(user, callback);
  });
};

exports.markMessageAsRead = function markMessageAsRead(mailId, callback) {
  var collection = db.collection('emails');

  collection.update({ _id: mailId }, {
    $set: {
      unread: false
    }
  }, callback);
};

exports.markMessageAsLatest = function markMessageAsLatest(user, mailId, callback) {
  user.latestEmail = mailId;
  updateUser(user, callback);
};

exports.markMessageAsSeen = function markMessageAsSeen(mailId, callback) {
  var collection = db.collection('emails');

  collection.update({ _id: mailId }, {
    $set: {
      seen: true
    }
  }, callback);
};
