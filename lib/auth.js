module.exports = {
  authorize: function (req, res, next) {
    if (!req.session.user) {
      return res.redirect('/auth');
    } else {
      return next();
    }
  }
};
