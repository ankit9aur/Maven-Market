var Review = require("../models/review");

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Login to continue!!");
  res.redirect("/login");
}

function isAdmin(req, res, next) {
  usname = req.user.username;
  if (req.isAuthenticated()) {
    if (usname == "admin") {
      return next();
    }
    req.flash("error", "Permission Denied!!");
    res.redirect("/products");
  } else {
    req.flash("error", "Login to continue!!");
    res.redirect("/login");
  }
}

function reviewOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    Review.findById(req.params.review_id, function (err, review) {
      if (err) {
        req.flash("error", "Review not found!!");
        res.redirect("/products/" + req.params.id);
      } else {
        if (review.user == req.user.username) {
          next();
        } else {
          req.flash("error", "Permission Denied!!");
          res.redirect("/products/" + req.params.id);
        }
      }
    });
  } else {
    req.flash("error", "Login to continue!!");
    res.redirect("/login");
  }
}

function inCart(req, res, next) {
  if (req.isAuthenticated()) {
    if (
      req.user.cart.items.some(function (cartItem) {
        return cartItem.product._id.equals(req.params.id);
      })
    ) {
      req.flash("error", "This product is already present in your cart!!");
      res.redirect("/products");
    } else {
      next();
    }
  } else {
    req.flash("error", "Login to continue!!");
    res.redirect("/login");
  }
}

module.exports = { isAdmin, isLoggedIn, reviewOwnership, inCart };
