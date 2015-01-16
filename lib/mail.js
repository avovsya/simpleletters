var gmailLib = require('./gmail');
var store = require('./store');

exports.get = gmailLib.getMessage;

exports.markAsRead = function markAsRead(mailId, callback) {
  gmailLib.markMessageAsRead(mailId, function (err) {
    if (err) {
      console.log("GMAIL ERROR: ", err);
      return callback(err);
    }
    store.markMessageAsRead(mailId, callback);
  });
};

exports.markAsSeen = function markAsSeen(mailId, callback) {
  store.markMessageAsSeen(mailId, callback);
};
