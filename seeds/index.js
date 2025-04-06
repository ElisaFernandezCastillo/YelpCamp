const mongoose = require("mongoose");
const cities = require("./cities");
const {places, descriptors} = require("./seedHelpers")
const Campground = require("../models/campground")

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

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for (let i = 0; i <300; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: "67ba0f28a208ee1fd8932833",
            location : `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Accusamus maiores, odio consectetur, error eligendi ducimus nam, officia illo optio adipisci esse. Ratione voluptate numquam esse possimus nemo ullam! Dignissimos, non.',
            price,
            geometry: {
                "type": "Point", 
                "coordinates": [
                    cities[random1000].longitude, 
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dxsex8uip/image/upload/v1741243809/YelpCamp/aawiznhmklm0blctnqp3.jpg',
                  filename: 'YelpCamp/aawiznhmklm0blctnqp3'
                },
                {
                  url: 'https://res.cloudinary.com/dxsex8uip/image/upload/v1741243809/YelpCamp/ogykvlg41chlgnjlmros.jpg',
                  filename: 'YelpCamp/ogykvlg41chlgnjlmros'
                }
              ]
        })
        await camp.save();
    }
}
// Since seedDB is an async function, we can use the then for waiting for something to be returned
seedDB().then(() => {
    // This is to prevent the program from continous execution and the database to stop listening
    mongoose.connection.close();
})