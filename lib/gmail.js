var config = require('config');
var async = require('async');
var _ = require('lodash');
var moment = require("moment");

var google = require('googleapis');
var gmail = google.gmail('v1');
var OAuth2 = google.auth.OAuth2;
var store = require('./store');

var oauth2Client = new OAuth2(config.credentials.google.id,
                              config.credentials.google.secret,
                              config.credentials.google.callbackUrl);

var scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/gmail.readonly'
];

var authUrl = oauth2Client.generateAuthUrl({
  scope: scopes
});

var authCallbackHandler = function authCallbackHandler(code, callback) {
  oauth2Client.getToken(code, function(err, tokens) {
    if(!err) {
      oauth2Client.setCredentials(tokens);
      google.options({ auth: oauth2Client });
      _getUserData(function (err, user) {
        if (err) {
          return callback(err);
        }
        return callback(null, user);
      });
    }
  });
};

var _getUserData = function (callback) {
  google.oauth2('v1').userinfo.get({}, function(err, results){
    if (err) {
      return callback(err);
    }
    callback(null, {
      id: results.id,
      email: results.email,
      name: results.name,
    });
  });
};

var getNewsletters = function (user, lastUpdated, callback) {
  var query = 'label:newsletters label:unread';
  if (lastUpdated) {
    var after = moment(lastUpdated).add(-1, 'days').format('YYYY/MM/DD');
    query = query + ' after:' + after;
  }
  gmail.users.messages.list({
    includeSpamTrash: false,
    q: query,
    userId: 'me'
  }, function (err, results) {
    if (err) {
      return callback(err);
    }
    var ids = _.pluck(results.messages, 'id');
    _getMessagesSnippets(ids, function (err, messageSnippets) {
      if (err) {
        return callback(err);
      }
      return callback(null, messageSnippets);
    });
  });
};

var _getMessagesSnippets = function (ids, callback) {
  async.map(
    ids,
    function (id, cb) {
      gmail.users.messages.get({
        id: id,
        userId: 'me',
        format: 'metadata'
      }, cb);
    },
    function (err, results) {
      if (err) {
        return callback(err);
      }
      var messages = _.map(results, function (message) {
        var subject = _.find(message.payload.headers, { 'name': 'Subject' }).value;
        var from = _.find(message.payload.headers, { 'name': 'From' }).value;
        var unread = !!_.find(message.labelIds, function (label) { return label === 'UNREAD'; });
        var date = _.find(message.payload.headers, { 'name': 'Date' }).value;
        if (date) {
          date = moment(date).valueOf();
        }
        return {
          // TODO: ensure that gmail message id is unique across accounts
          _id: message.id,
          snippet: message.snippet,
          subject: subject,
          from: from,
          unread: unread,
          date: date
        };
      });
      return callback(null, messages);
    }
  );
};

var getMessage = function (id, callback) {
  var body;
  gmail.users.messages.get({
    id: id,
    userId: 'me',
    format: 'full'
  }, function (err, result) {
    if (err) {
      return callback(err);
    }
    var htmlBody = _.find(result.payload.parts, { mimeType: 'text/html' });
    var plainBody = _.find(result.payload.parts, { mimeType: 'text/plain' });
    if (htmlBody) {
      body = htmlBody.body.data;
    } else {
      body = plainBody.body.data;
    }
    var buf = new Buffer(body, 'base64');
    callback(null, buf.toString());
  });
};

module.exports = {
  authUrl: authUrl,
  authCallbackHandler: authCallbackHandler,
  getNewsletters: getNewsletters,
  getMessage: getMessage
};
