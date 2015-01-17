var auth = require('../lib/auth');
var store = require('../lib/store');

exports.googleAuthView = function googleAuthView(req, res) {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('auth', {
    authUrl: auth.authUrl
  });
};

exports.googleAuthCallback = function googleAuthCallback(req, res, next) {
  auth.googleAuthCallback(req.query.code, function (err, userData) {
    if (err) {
      return next(err);
    }
    store.findUser(userData.email, function (err, user) {
      if (err) {
        return next(err);
      }
      if (user) {
        req.session.user = user;
        return res.redirect('/');
      } else {
        //userData.lastUpdated = new Date().getTime();
        store.createUser(userData, function (err, result) {
          if (err) {
            return next(err);
          }
          req.session.user = userData;
          res.redirect('/list/import');
        });
      }
    });
  });
};

exports.logout = function logout(req, res) {
  req.session.destroy(function () {
    res.redirect('/');
  });
};
