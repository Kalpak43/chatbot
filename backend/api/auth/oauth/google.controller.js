export function signinWithGoogle(req, res, next) {
  req.session.redirect = req.query.redirect || "/dashboard";
  next();
}
