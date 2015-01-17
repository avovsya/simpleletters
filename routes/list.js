var _ = require("lodash");

var mail = require('../lib/mail');

var UPDATE_PERIOD = 15 * 60; // Update list at least every 15 minutes

exports.emailListView = function emailListView(req, res, next) {
  var renderList = function renderList(err) {
    if (err) {
      return next(err);
    }
    mail.getEmails(req.session.user, function (err, emails) {
      if (err) {
        return next(err);
      }
      var latestEmail = _.find(emails, {
        _id: req.session.user.latestEmail
      });
      res.render('list', {
        letters: emails,
        latestEmail: latestEmail
      });
    });
  };

  var timeFromLastUpdate = (new Date() - req.session.user.lastUpdated) / 1000;
  if (timeFromLastUpdate >= UPDATE_PERIOD) {
    mail.refreshEmails(req.session.user, req.session.user.lastUpdated, renderList);
  } else {
    renderList();
  }
};

exports.importAllEmails = function importAllEmails(req, res, next) {
  var lastUpdated;
  if (req.query.type === 'recent') {
    lastUpdated = req.session.user.lastUpdated;
  } else if (req.session.user.lastUpdated) {
    return res.redirect('/');
  }

  mail.refreshEmails(req.session.user, lastUpdated, function (err) {
    if (err) {
      return next(err);
    }
    return res.redirect('/');
  });
};
