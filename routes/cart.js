var express = require("express");
var router = express.Router();
var Product = require("../models/product");
var User = require("../models/user");
var commonMiddlewares = require("../middlewares/common.js");

var isLoggedIn = commonMiddlewares.isLoggedIn;
var inCart = commonMiddlewares.inCart;

router.get("/new/:id/:return", inCart, function (req, res) {
	var cartItem = {
		product: req.params.id,
		qty: 1
	}
	req.user.cart.items.unshift(cartItem);
	Product.findById(req.params.id, function (err, product) {
		if (err || !product) {
			req.flash("error", "Product not found!!");
			res.redirect("/products");
		} else {
			req.user.cart.tax_total += product.tax;
			req.user.cart.total += product.price + product.tax;
			req.user.cart.discount += product.mrp - product.price;
			req.user.cart.cart_total += product.mrp;
			req.user.save();
		}
	});
	req.flash("success", "Product added to Cart!!");
	if (req.params.return == "show") {
		res.redirect("/products/" + req.params.id);
	} else {
		res.redirect("/products");
	}
});

router.get("/", isLoggedIn, function (req, res) {
	User.findById(req.user._id).populate("cart.items.product").exec(function (err, user) {
		if (err || !user) {
			req.flash("error", "Something went wrong!!");
			res.redirect("/products");
		} else {
			res.render("cart/show", { user: user });
		}
	});
});

router.get("/:action", isLoggedIn, function (req, res) {
	User.findById(req.user._id).populate("cart.items.product").exec(function (err, user) {
		if (err || !user) {
			req.flash("error", "Something went wrong!!");
			res.redirect("/products");
		} else {
			if (req.params.action == 'clear-cart') {
				for (var i = user.cart.items.length - 1; i >= 0; i--) {
					user.cart.items.splice(i, 1);
				}
				user.cart.tax_total = 0;
				user.cart.total = 0;
				user.cart.discount = 0;
				user.cart.cart_total = 0;
				user.save();
				req.flash("success", "Cart Cleared!!");
				res.redirect("/cart");
			}
		}
	});
});

router.get("/:id/:action", isLoggedIn, function (req, res) {
	User.findById(req.user._id).populate("cart.items.product").exec(function (err, user) {
		if (err || !user) {
			req.flash("error", "Something went wrong!!");
			res.redirect("/products");
		} else {
			for (var i = user.cart.items.length - 1; i >= 0; i--) {
				var cartItem = user.cart.items[i];
				if (cartItem.product._id.equals(req.params.id)) {
					if (req.params.action == 'rem') {
						user.cart.cart_total -= (cartItem.product.mrp * cartItem.qty);
						user.cart.discount -= (cartItem.product.discount * cartItem.qty);
						user.cart.total -= ((cartItem.product.price + cartItem.product.tax) * cartItem.qty);
						user.cart.tax_total -= (cartItem.qty*cartItem.product.tax);
						user.cart.items.splice(i, 1);
					} else {
						if (req.params.action == 'inc') {
							user.cart.cart_total += cartItem.product.mrp;
							user.cart.discount += cartItem.product.discount;
							user.cart.total += cartItem.product.price + cartItem.product.tax;
							user.cart.tax_total += cartItem.product.tax;
							cartItem.qty++;
						} else if (req.params.action == 'dec') {
							user.cart.cart_total -= cartItem.product.mrp;
							user.cart.discount -= cartItem.product.discount;
							user.cart.total -= cartItem.product.price + cartItem.product.tax;
							user.cart.tax_total -= cartItem.product.tax;
							cartItem.qty--;
							if (cartItem.qty == 0) {
								user.cart.items.splice(i, 1);
							}
						}
					}
					break;
				}
			}
			user.save();
			req.flash("success", "Cart updated!!");
			res.redirect("/cart");
		}
	});
});



module.exports = router;