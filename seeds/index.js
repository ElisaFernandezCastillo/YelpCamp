require("dotenv").config();
const mongoose = require("mongoose");
const cities = require("./cities");
const {places, descriptors} = require("./seedHelpers")
const Campground = require("../models/campground")
// "mongodb://localhost:27017/yelp-camp"

mongoose.connect(process.env.DB_URL, {
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

const seed_authors = ["67fd568245bcdcf4d75b4dea", "67fd5d0ef0f2cb770d884cb2", "67fd5d2cf0f2cb770d884cbf", "67f99cc297e5f794c24cfbe3"]
const seed_images = [["https://res.cloudinary.com/dxsex8uip/image/upload/v1744657548/campground1_bykawu.jpg", "campground1_bykawu"],
    ["https://res.cloudinary.com/dxsex8uip/image/upload/v1744657547/camground2_twutga.webp", "camground2_twutga"],
    ["https://res.cloudinary.com/dxsex8uip/image/upload/v1744657547/campground2_b9muld.jpg", "campground2_b9muld"],
    ["https://res.cloudinary.com/dxsex8uip/image/upload/v1744657547/campground4_lselva.avif", "campground4_lselva"]
]

const seedDB = async() => {
    await Campground.deleteMany({});
    for (let i = 0; i <200; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const random_author = Math.floor(Math.random() * 4);
        const random_images1 = Math.floor(Math.random() * 4);
        const random_images2 = Math.floor(Math.random() * 4);
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: seed_authors[random_author],
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
                  url: seed_images[random_images1][0],
                  filename: seed_images[random_images1][1]
                },
                {
                  url: seed_images[random_images2][0],
                  filename: seed_images[random_images2][1]
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