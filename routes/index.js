var express = require('express');
var router = express.Router();
var gmail = require('../lib/gmail');


/* GET home page. */
router.get('/', function(req, res) {
  if (!req.session.user) {
    return res.redirect('auth');
  }
  gmail.getNewsletters(function (err, result) {
    if (err) {
      //TODO: handle error
      res.send(500, err);
    }
    res.render('index', { letters: result });
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
