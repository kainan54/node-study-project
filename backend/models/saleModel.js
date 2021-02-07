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
    price: {
        type: Number,
        required: [true, 'Error: Sale price is Required'],
    },
    qty: {
        type: Number,
        required: [true, 'Error: Sale requires qty'],
    },
    mainImage: {
        type: String,
    },
    images: {
        type: [String],
    },
    // createdAt: {
    //     // mongoose auto converts into legit date lol
    //     type: Date.now(),
    // },
});

const Sale = mongoose.model('Sale', saleSchema);
module.exports = Sale;
