const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require('ejs-mate');
const session = require('express-session'); // we are going to use this for authentication and for flashing messages
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError")
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user")
const { error } = require("console");


const userRoutes = require("./routes/users")
const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews")

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
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // by using the locals we will have access to that information in the templates automatically.
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.get("/fakeUser", async (req, res) => {
    const user = new User({email: "elisa.fc@gmail.com", username: "eli"})
    const newUser = await User.register(user, "chicken"); //chicken is the password
    res.send(newUser);
})

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes); //if we need access to this is on the router we have to use the mergeParams value in the router 

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