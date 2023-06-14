var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Order = require("../models/order");

var commonMiddlewares = require("../middlewares/common.js");

var isLoggedIn = commonMiddlewares.isLoggedIn;
var isAdmin = commonMiddlewares.isAdmin;

router.get("/order/:id/success", isLoggedIn, function (req, res) {
  res.render("cart/confirmation", { id: req.params.id });
});

router.get("/orders", isLoggedIn, function (req, res) {
  console.log(req.user.orders);
  User.findById(req.user.id)
    .populate("orders")
    .exec(function (err, user) {
      if (err || !user) {
        req.flash("error", "Something went wrong!!");
        res.redirect("/products");
      } else {
        console.log(user.orders);
        res.render("orders/index", { orders: user.orders });
      }
    });
});

router.get("/all-orders", isAdmin, function (req, res) {
  Order.find({}, function (err, orders) {
    if (err) {
      req.flash("error", "Something went wrong!!");
      res.redirect("/products");
    } else {
      res.render("orders/index", { orders });
    }
  });
});

router.get("/orders/:id", isLoggedIn, function (req, res) {
  Order.findById(req.params.id, function (err, order) {
    if (err || !order) {
      req.flash("error", "Order not found!!");
      res.redirect("/products");
    } else {
      res.render("orders/show", { order: order });
    }
  });
});

module.exports = router;
