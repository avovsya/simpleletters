var gmailLib = require('../lib/gmail');
var store = require('../lib/store');

exports.emailListView = function emailListView(req, res) {
  store.getEmails(req.session.user, function (err, emails) {
    if (err) {
      return res.send(500, err);
    }
    res.render('list', { letters: emails });
  });
};

exports.importAllEmails = function importAllEmails(req, res) {
  // Only for new user
  // TODO: guard this from returning user
  // TODO: update user's lastUpdated field
  gmailLib.getNewsletters(req.session.user, function (err, newsletters) {
    if (err) {
      return res.send(500, err);
    }
    store.saveEmails(req.session.user, newsletters, function (err) {
      if (err) {
        return res.send(500, err);
      }
      return res.redirect('/');
    });
  });
};
