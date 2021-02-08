const mongoose = require('mongoose');
const saleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Error: Sale title is Required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Error: Sale Description is Required'],
        trim: true,
    },
    tags: {
        type: [String],
        required: [true, 'Error: Sale tags are Required'],
    },
    price: {
        type: Number,
        required: [true, 'Error: Sale price is Required'],
    },
    qty: {
        type: Number,
        required: [true, 'Error: Sale requires qty'],
    },
    mainImage: {
        type: { url: String, key: String },
        required: [true, 'Error: Main Image required'],
    },
    images: {
        type: [String],
    },
    createdAt: {
        type: Date,
        // mongoose auto converts into legit date lol
        default: Date.now(),
    },
});

const Sale = mongoose.model('Sale', saleSchema);
module.exports = Sale;
