const express = require("express");
const router = express.Router({ mergeParams: true });
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");

// Middleware to validate review
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body.review);
  if (error) {
    const errorMsg = error.details.map(el => el.message).join(', ');
    throw new ExpressError(400, errorMsg);
  } else {
    next();
  }
};

// Create review
router.post("/", validateReview, wrapAsync(async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID format");
  }

  const listing = await Listing.findById(id);
  const review = new Review(req.body.review);
  listing.reviews.push(review);

  await review.save();
  await listing.save();
  req.flash("success", "Successfully created a new review!");

  res.redirect(`/listings/${id}`);
}));

// Delete review
router.delete("/:reviewId", wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID format");
  }
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ExpressError(400, "Invalid review ID format");
  }

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted a review!");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;
