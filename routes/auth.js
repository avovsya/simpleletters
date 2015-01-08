var gmailLib = require('../lib/gmail');
var store = require('../lib/store');

exports.googleAuthView = function googleAuthView(req, res) {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('auth', {
    authUrl: gmailLib.authUrl
  });
};

exports.googleAuthCallback = function googleAuthCallback(req, res) {
  gmailLib.authCallbackHandler(req.query.code, function (err, userData) {
    if (err) {
      return res.send(500, err);
    }
    store.findUser(userData.email, function (err, user) {
      if (err) {
        return res.send(500, err);
      }
      if (user) {
        req.session.user = user;
        return res.redirect('/');
      } else {
        var lastUpdated = new Date().getTime();
        userData.lastUpdated = new Date().getTime();
        store.createUser(userData, function (err, result) {
          if (err) {
            return res.send(500, err);
          }
          req.session.user = userData;
          gmailLib.getNewsletters(userData, function (err, newsletters) {
            if (err) {
              return res.send(500, err);
            }
            store.saveEmails(userData, newsletters, function (err) {
              if (err) {
                return res.send(500, err);
              }
              return res.redirect('/');
            });
          });
        });
      }
    });
  });
};
