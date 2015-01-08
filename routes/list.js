var store = require('../lib/store');

exports.emailListView = function emailListView(req, res) {
  store.getEmails(req.session.user, function (err, emails) {
    if (err) {
      return res.send(500, err);
    }
    res.render('list', { letters: emails });
  });
};
