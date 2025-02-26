const express = require('express');
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const {isLoggedIn, isAuthor, validateCampground} = require("../middleware")



/* router.get("/makecampground", async (req, res) => {
const camp = new Campground({title: "My Backyard", description: "cheap camping!"});
await camp.save();
res.send(camp);
}) */

router.get("/", catchAsync(campgrounds.index));

// This is the form to make a new campground, this should come first compared to /campgrounds/:id otherwise we are directed here
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// we can do a validation of the campground at this level calling the validateCampground middleware
router.post("/", isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

router.get("/:id", catchAsync(campgrounds.showCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;