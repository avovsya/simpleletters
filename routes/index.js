var express = require('express');
var router = express.Router();
var gmail = require('../lib/gmail');


/* GET home page. */
router.get('/', function(req, res) {
  if (!req.session.user) {
    console.log(req.session.user);
    return res.redirect('auth');
  }
  res.render('index', { title: 'Express' });
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
  // Set user email to session variable
});

module.exports = router;
