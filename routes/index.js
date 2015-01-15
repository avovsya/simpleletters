var express = require('express');
var router = express.Router();
var gmailLib = require('../lib/gmail');
var authorize = require('../lib/auth').authorize;

var list = require('./list');
var auth = require('./auth');
var mail = require('./mail');

router.get('/', function(req, res) {
  if (req.session.user) {
    return res.redirect('/list');
  }
  res.render('index', {
    authUrl: gmailLib.authUrl
  });
});

//router.get('/auth', auth.googleAuthView);
router.get('/api/auth/callback', auth.googleAuthCallback);

router.get('/list', authorize, list.emailListView);
router.get('/list/import', authorize, list.importAllEmails);

router.get('/mail/:mailId', authorize, mail.getMailView);
router.get('/mail/:mailId/markread', authorize, mail.markAsRead);

module.exports = router;
