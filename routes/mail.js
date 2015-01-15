var mail = require('../lib/mail');

exports.getMailView = function getMailView(req, res) {
  mail.get(req.params.mailId, function (err, result) {
    if (err) {
      res.send(500, err);
    }
    res.render('mail', { body: result, id: req.params.mailId, pos: req.query.pos });
  });
};

exports.markAsRead = function markAsRead(req, res) {
  mail.markAsRead(req.params.mailId, function (err, result) {
    if (err) {
      return res.send(500, err);
    }
    res.redirect('/list');
  });
};
