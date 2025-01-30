const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require('ejs-mate');
const session = require('express-session'); // we are going to use this for authentication and for flashing messages
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError")
const methodOverride = require("method-override");
const { error } = require("console");


const campgrounds = require("./routes/campgrounds")
const reviews = require("./routes/reviews")

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
const sessionConfig = {
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 *60 * 24 *7, //this is all in milliseconds
        maxAge: 1000 * 60 *60 * 24 *7
    }
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "public")))
app.use(session(sessionConfig));
app.use(flash());
app.use((req, res, next) => {
    // by using the locals we will have access to that information in the templates automatically. 
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})


app.use("/campgrounds", campgrounds);
app.use('/campgrounds/:id/reviews', reviews); //if we need access to this is on the router we have to use the mergeParams value in the router 

app.get("/", (req, res) => {
    res.render("home");
})


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