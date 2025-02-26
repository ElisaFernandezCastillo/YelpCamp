const express = require('express');
const router = express.Router({mergeParams: true}); //this parameter is needed so that the path that comes from app.js contains the id.
const reviews = require("../controllers/reviews")
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const Review = require("../models/review")
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware")

const ExpressError = require("../utils/ExpressError")

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;