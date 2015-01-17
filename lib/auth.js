var gmail = require('./gmail');

module.exports = {
  authorize: function (req, res, next) {
    if (!req.session.user) {
      return res.redirect('/');
    } else {
      return next();
    }
  },

  googleAuthCallback: gmail.authCallbackHandler,

  authUrl: gmail.authUrl
};
