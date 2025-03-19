const Campground = require("../models/campground");

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new")
}

module.exports.createCampground = async (req,res, next) => {
    // if(!req.body.campground) throw new ExpressError("Invalid Campground", 400);
    //res.send(req.body); //in order for the body to be parsed and transferred, we need to add a library that does the parsing router.use(express.urlencoded)
    // The validations of the objects we recieve are going to be made using the JOI library
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash("success", "Successfully made a new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
    
}

module.exports.showCampground = async (req, res) =>{
    const campground = await Campground.findById(req.params.id)
    .populate({path: "reviews", 
        populate: {path: "author"}}).
        populate("author");
     
    if(!campground){
        req.flash('error', "Cannot find that campground!")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", {campground})
}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error', "Cannot find that campground!")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", {campground})
}

module.exports.updateCampground = async (req, res) => {
    const {id} = req.params;
     const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}) // saving as an object in the EJS file edit.ejs allows us to access the object from the body
     const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
     campground.images.push(...imgs) // using the spread operator to concatenate the arrays
     await campground.save()
    req.flash("success", "Successfully updated campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}
    


module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!")
    res.redirect("/campgrounds") 
}