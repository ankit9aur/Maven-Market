var express = require("express");
var router = express.Router();
var Product = require("../models/product");
var User = require("../models/user");
var commonMiddlewares = require("../middlewares/common.js");

var isAdmin = commonMiddlewares.isAdmin;

router.get("/", function (req, res) {
  Product.find({}, function (err, products) {
    if (err) {
      req.flash("error", "Something went wrong!!");
      res.redirect("/products");
    } else {
      let categories = products.map((product) => product.category);
      categories = [...new Set(categories)];
      res.render("products/index", { categories });
    }
  });
});

router.get("/new", function (req, res) {
  res.render("products/new");
});

router.post("/", isAdmin, function (req, res) {
  req.body.product.discount = req.body.product.mrp - req.body.product.price;
  req.body.product.disc_perc = Math.round(
    ((req.body.product.mrp - req.body.product.price) * 100) /
      req.body.product.mrp
  );
  var tax = 0;
  if (req.body.product.category == "Products") {
    if (req.body.product.price > 1000 && req.body.product.price <= 5000) {
      tax += (req.body.product.price * 12) / 100;
    } else if (req.body.product.price > 5000) {
      tax += (req.body.product.price * 18) / 100;
    } else {
      tax += 200;
    }
  } else {
    if (req.body.product.price > 1000 && req.body.product.price <= 8000) {
      tax += req.body.product.price / 10;
    } else if (req.body.product.price > 8000) {
      tax += (req.body.product.price * 15) / 100;
    } else {
      tax += 100;
    }
  }
  tax = Math.round(tax);
  req.body.product.tax = tax;
  Product.create(req.body.product, function (err, product) {
    if (err) {
      req.flash("error", "Something went wrong!!");
      res.redirect("/products");
    } else {
      req.flash("success", "Product added!!");
      res.redirect("/products");
    }
  });
});

router.get("/category/:category", function (req, res) {
  const categoryName = req.params.category;
  let option = {};
  if (categoryName !== "all") {
    option = { category: categoryName.replaceAll("-", " ") };
  }

  Product.find(option, function (err, products) {
    if (err) {
      req.flash("error", "Something went wrong!!");
      res.redirect("/products");
    } else {
      res.render("products/category", {
        products,
        category: req.params.category,
      });
    }
  });
});

router.get("/:id", function (req, res) {
  Product.findById(req.params.id)
    .populate("reviews")
    .exec(function (err, product) {
      if (err || !product) {
        req.flash("error", "Product not found!!");
        res.redirect("/products");
      } else {
        res.render("products/show", { product: product });
      }
    });
});

module.exports = router;
