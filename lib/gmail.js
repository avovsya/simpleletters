var config = require('config');
var async = require('async');
var _ = require('lodash');

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

var authCallbackHandler = function (req, res, next) {
  var code = req.query.code;
  oauth2Client.getToken(code, function(err, tokens) {
    if(!err) {
      oauth2Client.setCredentials(tokens);
      google.options({ auth: oauth2Client });
      getUserData(function (err, user) {
        if (err) {
          console.log('ERROR:', err);
          return next(err);
        }
        store.getOrCreateUser(user, function (err, result) {
          if (err) {
            return next(err);
          }
          user.lastUpdated = result.lastUpdated;
          req.session.user = user;
          next();
        });
      });
    }
  });
};

var getUserData = function (callback) {
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


var getNewsletters = function (user, callback) {
  gmail.users.messages.list({
    includeSpamTrash: false,
    q: 'label:newsletters',
    userId: 'me'
  }, function (err, results) {
    if (err) {
      return callback(err);
    }
    var ids = _.pluck(results.messages, 'id');
    getMessagesSnippets(ids, function (err, messageSnippets) {
      if (err) {
        return callback(err);
      }
      store.updateUserLastUpdated(user, function (err) {
        if (err) {
          return callback(err);
        }
        return callback(null, messageSnippets);
      });
    });
  });
};

var getMessagesSnippets = function (ids, callback) {
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
        return {
          id: message.id,
          snippet: message.snippet,
          subject: subject,
          from: from,
          unread: unread
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
