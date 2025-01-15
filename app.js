const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require('ejs-mate');
const {campgroundSchema} = require("./schemas.js")
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError")
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Review = require("./models/review")
const { error } = require("console");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next(); 
    }
}

app.get("/", (req, res) => {
    res.render("home");
})

/* app.get("/makecampground", async (req, res) => {
    const camp = new Campground({title: "My Backyard", description: "cheap camping!"});
    await camp.save();
    res.send(camp);
}) */

app.get("/campgrounds", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}))

// This is the form to make a new campground, this should come first compared to /campgrounds/:id otherwise we are directed here
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new")
})

// we can do a validation of the campground at this level calling the validateCampground middleware
app.post("/campgrounds", validateCampground, catchAsync(async (req,res, next) => {
    // if(!req.body.campground) throw new ExpressError("Invalid Campground", 400);
    //res.send(req.body); //in order for the body to be parsed and transferred, we need to add a library that does the parsing app.use(express.urlencoded)
    // The validations of the objects we recieve are going to be made using the JOI library
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
    
}))

app.get("/campgrounds/:id", catchAsync(async (req, res) =>{
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/show", {campground})

}))

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/edit", {campground})
}))

app.put("/campgrounds/:id", validateCampground, catchAsync(async(req, res) => {
   const {id} = req.params;
   const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}) // saving as an object in the EJS file edit.ejs allows us to access the object from the body
   res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds") 
}))

app.post("/campgrounds/:id/reviews", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

// A path that doesn't exist will end up here
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found!!", 404))
})

// All other errors that happend during the handling og the async functions will end up here
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = "Oh no, something went wrong!"
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log("Serving on port 3000");
})