var gmailLib = require('./gmail');
var store = require('./store');

exports.get = gmailLib.getMessage;

exports.getEmails = store.getEmails;

exports.markAsRead = function markAsRead(mailId, callback) {
  gmailLib.markMessageAsRead(mailId, function (err) {
    if (err) {
      console.log("GMAIL ERROR: ", err);
      return callback(err);
    }
    store.markMessageAsRead(mailId, callback);
  });
};

exports.markAsSeen = function markAsSeen(user, mailId, callback) {
  store.markMessageAsLatest(user, mailId, function (err) {
    if (err) {
      return callback(err);
    }
    store.markMessageAsSeen(mailId, callback);
  });
};

exports.refreshEmails = function refreshEmails (user, lastUpdated, callback) {
  gmailLib.getNewsletters(user, lastUpdated,  function (err, newsletters) {
    if (err) {
      return callback(err);
    }
    store.saveEmails(user, newsletters, function (err) {
      if (err) {
        return callback(err);
      }
      return callback();
    });
  });
};
