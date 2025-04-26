import { redirectUri } from "../../../const.js";

export function signinWithGoogle(req, res, next) {
  req.session.redirect = req.query.redirect || "/dashboard";
  redirectUri.rd = req.query.redirect;

  console.log("----------------------------");
  console.log(req.query.redirect);
  console.log(req.session.redirect);
  console.log("----------------------------");

  next();
}
