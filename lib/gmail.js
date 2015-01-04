var config = require('config');
var async = require('async');
var _ = require('lodash');

var google = require('googleapis');
var gmail = google.gmail('v1');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(config.credentials.google.id,
                              config.credentials.google.secret,
                              config.credentials.google.callbackUrl);

var scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/gmail.readonly'
];

var authUrl = oauth2Client.generateAuthUrl({
  //access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
  scope: scopes // If you only need one scope you can pass it as string
});

var setSessionData = function (req, callback) {
  google.oauth2('v1').userinfo.get({}, function(err, results){
    if (err) {
      // TODO: handle error
      return callback(err);
    }
    req.session.user = {
      id: results.id,
      email: results.email,
      name: results.name
    };
    callback();
  });
};

var authCallbackHandler = function (req, res, next) {
  var code = req.query.code;
  // TODO: if user rejects authorization, what would be here?
  oauth2Client.getToken(code, function(err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    if(!err) {
      oauth2Client.setCredentials(tokens);
      google.options({ auth: oauth2Client });
      return setSessionData(req, next);
    }
    next(err);
  });
};

var getNewsletters = function (callback) {
  gmail.users.messages.list({
    includeSpamTrash: false,
    q: 'label:newsletters',
    userId: 'me'
  }, function (err, results) {
    if (err) {
      return callback(err);
    }
    var ids = _.pluck(results.messages, 'id');
    getMessagesSnippets(ids, callback);
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

module.exports = {
  authUrl: authUrl,
  authCallbackHandler: authCallbackHandler,
  getNewsletters: getNewsletters
};
