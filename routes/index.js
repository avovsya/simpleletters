var express = require('express');
var router = express.Router();
var gmail = require('../lib/gmail');
var authorize = require('../lib/auth').authorize;

/* GET home page. */
router.get('/', authorize, function(req, res) {
  gmail.getNewsletters(req.session.user, function (err, result) {
    if (err) {
      return res.send(500, err);
    }
    res.render('index', { letters: result });
  });
});

router.get('/mail/:mailId', authorize, function (req, res) {
  gmail.getMessage(req.params.mailId, function (err, result) {
    if (err) {
      res.send(500, err);
    }
    res.send(result);
  });
});

router.get('/auth', function (req, res) {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('auth', {
    authUrl: gmail.authUrl
  });
});

router.get('/api/auth/callback', gmail.authCallbackHandler, function (req, res) {
  res.redirect('/');
});

module.exports = router;
