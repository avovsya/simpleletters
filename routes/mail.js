var mail = require('../lib/mail');

exports.getMailView = function getMailView(req, res, next) {
  mail.get(req.params.mailId, function (err, result) {
    if (err) {
      return next(err);
    }
    mail.markAsSeen(req.session.user, req.params.mailId, function (err) {
      if (err) {
        return next(err);
      }
      res.render('mail', {
        title: result.subject + ' - ' + 'The Retl',
        body: result.body,
        subject: result.subject,
        id: req.params.mailId,
        pos: req.query.pos
      });
    });
  });
};

exports.markAsRead = function markAsRead(req, res, next) {
  mail.markAsRead(req.params.mailId, function (err, result) {
    if (err) {
      return next(err);
    }
    res.redirect('/list');
  });
};
