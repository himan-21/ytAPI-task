const express = require('express');
const mongoose = require('mongoose');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const Video = require('./models/Video');

// Load config
dotenv.config({ path: './.env' })

const app = express();


app.use(express.json());
app.set('views', './views');
app.set('view engine', 'ejs');

// mongoose connection
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL,
    {
        useNewUrlParser: true,
        // useFindAndModify: false,
        // useUnifiedTopology: true,
    }
);

// db connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function() {
    console.log("Connection successful!");
})


// running app on port 3001
app.listen(3001, () => {
    console.log("App is running on port 3001");
})

// getting videos from the youtube api
async function searchVideos() {
    const searchQuery = "football";
    // youtube api calling
    await google.youtube('v3').search.list({
        key: process.env.YOUTUBE_TOKEN,
        type: 'video',
        order: 'date',
        part: 'snippet',
        q: searchQuery,
        publishedAfter: ('2010-01-01T00:00:00Z'),
        // maxResults: 30,
    }).then(response => {
        const { data } = response
        // console.log("response", data.items);
        // res.send(data.items)
        data.items.map((item) => {
            // assigning the values to the db video schema
            const video = new Video({
                query: searchQuery,
                title: item.snippet.title,
                description: item.snippet.description,
                publishedAt: item.snippet.publishedAt,
                thumbnails: item.snippet.thumbnails,
                channel: item.snippet.channelTitle,
            })

            // checking duplicates and adding to db accordingly
            Video.findOne({title: video.title, description: video.description }, (err, vid) => {
                if(err) console.error(err);
                if(!vid) {
                    video.save();
                }
            })  
        })
    }).catch((err) => next(err));
}

// searchVideos();

// getting the data from mongodb
app.get("/", (req, res) => {
    setInterval(searchVideos, 60000);
    Video.find({}, (err, videos) => {
        if(err) console.error(err);
        else {
            // res.send(videos);
            res.render('index', { data: videos});
        }
    }).sort({ publishedAt: -1 });
    // res.send("Running...")
});



