var express = require('express');
var router = express.Router();
var gmailLib = require('../lib/gmail');
var authorize = require('../lib/auth').authorize;

var list = require('./list');
var auth = require('./auth');
var mail = require('./mail');

router.get('/', authorize, function(req, res) {
  return res.redirect('/list');
});

router.get('/auth', auth.googleAuthView);
router.get('/api/auth/callback', auth.googleAuthCallback);

router.get('/list', authorize, list.emailListView);

router.get('/mail/:mailId', authorize, mail.getMailView);

module.exports = router;
