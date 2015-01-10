var gmailLib = require('../lib/gmail');

exports.getMailView = function getMailView(req, res) {
  gmailLib.getMessage(req.params.mailId, function (err, result) {
    if (err) {
      res.send(500, err);
    }
    res.render('mail', { email: result });
  });
};
