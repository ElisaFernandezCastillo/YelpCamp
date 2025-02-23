const express = require('express');
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError")
const Campground = require("../models/campground");
const {campgroundSchema} = require("../schemas.js")
const {isLoggedIn} = require("../middleware")

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next(); 
    }
}


/* router.get("/makecampground", async (req, res) => {
const camp = new Campground({title: "My Backyard", description: "cheap camping!"});
await camp.save();
res.send(camp);
}) */

router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}))

// This is the form to make a new campground, this should come first compared to /campgrounds/:id otherwise we are directed here
router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new")
})

// we can do a validation of the campground at this level calling the validateCampground middleware
router.post("/", isLoggedIn, validateCampground, catchAsync(async (req,res, next) => {
    // if(!req.body.campground) throw new ExpressError("Invalid Campground", 400);
    //res.send(req.body); //in order for the body to be parsed and transferred, we need to add a library that does the parsing router.use(express.urlencoded)
    // The validations of the objects we recieve are going to be made using the JOI library
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
    
}))

router.get("/:id", catchAsync(async (req, res) =>{
    const campground = await Campground.findById(req.params.id).populate("reviews").populate("author");
    if(!campground){
        req.flash('error', "Cannot find that campground!")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", {campground})

}))

router.get("/:id/edit", isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error', "Cannot find that campground!")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", {campground})
}))

router.put("/:id", isLoggedIn, validateCampground, catchAsync(async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}) // saving as an object in the EJS file edit.ejs allows us to access the object from the body
    req.flash("success", "Successfully updated campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete("/:id", isLoggedIn, catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!")
    res.redirect("/campgrounds") 
}))

module.exports = router;