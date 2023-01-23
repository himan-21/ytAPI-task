const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
    query: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
    },
    publishedAt: {
        type: Date,
    },
    thumbnails: {
        type: Object,
    },
    channel: {
        type: String,
    }
})

module.exports = mongoose.model('Video', VideoSchema)