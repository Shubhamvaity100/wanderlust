const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const LocalStrategy=require("passport-local");
const { isLoggedIn }= require("../routes/middleware.js");

// Middleware to validate listing
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let errorMsg = error.details.map(el => el.message).join(', ');
    throw new ExpressError(400, errorMsg);
  } else {
    next();
  }
};

// Listings index
router.get("/", isLoggedIn,wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
}));

// New listing form
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new");
});

// Show listing
router.get("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID format");
  }

  const listing = await Listing.findById(id).populate("reviews");
  if (!listing) {
    req.flash("error", "Listing you requested could not be found");
    res.redirect("/listings");
    // throw new ExpressError(404, "Listing not found");
  }

  res.render("listings/show", { listing });
}));

// Create listing
router.post("/", validateListing, wrapAsync(async (req, res) => {
  const newlisting = new Listing(req.body.listing);
  await newlisting.save();
  req.flash("success", "Successfully created a new listing!");
  res.redirect("/listings");
}));

// Edit listing form
router.get("/:id/edit", isLoggedIn,wrapAsync(async (req, res) => {
  let { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID format");
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  res.render("listings/edit", { listing });
}));

// Update listing
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const { price } = req.body.listing;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID format");
  }

  if (price < 0) {
    throw new ExpressError(400, "Price cannot be negative");
  }

  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Successfully updated a listing!");
  res.redirect(`/listings/${id}`);
}));

// Delete listing
router.delete("/:id", isLoggedIn,wrapAsync(async (req, res) => {
  let { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID format");
  }

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Successfully Deleted a  listing!");
  res.redirect("/listings");
}));

module.exports = router;
