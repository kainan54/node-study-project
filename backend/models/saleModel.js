const mongoose = require('mongoose');
const slugify = require('slugify');

const saleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Error: Sale title is Required'],
        trim: true,
        maxLength: [50, 'Sale title is over 50 characters'],
    },
    description: {
        type: String,
        required: [true, 'Error: Sale Description is Required'],
        trim: true,
        maxLength: [500, 'description is over 500 characters'],
    },
    tags: {
        type: Map,
        of: Boolean,
        required: [true, 'Error: Sale tags are Required'],
        validate: {
            message: 'Maximum Number of tags is 20',
            validator: function (tags) {
                return Object.keys(tags).length < 20;
            },
        },
        validate: {
            message: 'Max tag character length is 10',
            validator: function (tags) {
                for (const tagName of Object.keys(tags)) {
                    if (tagName.length > 10) return false;
                }
                return true;
            },
        },
    },
    price: {
        type: Number,
        required: [true, 'Error: Sale price is Required'],
        min: [1, 'min price is 1'],
    },
    qty: {
        type: Number,
        required: [true, 'Error: Sale requires qty'],
        min: [1, 'min qty is 1'],
    },
    ratings: {
        type: [Object],
    },
    ratingsAvg: {
        type: Number,
        min: [1, 'min rating is 1'],
        max: [5, 'min rating is 5'],
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
    slug: {
        type: String,
    },
});

saleSchema.index({ title: 'text' });

// Middleware runs inbtwn .save() and .create(), this === saved document
saleSchema.pre('save', function (next) {
    this.slug = slugify(this.title, { lower: true });
    next();
});

// Middleware runs after .create(), doc === created document
saleSchema.post('save', function (doc, next) {
    console.log(doc);
    next();
});

// static method for Model Sales to convert incoming requests with tag array into hashmaps(for json file)
saleSchema.statics.convertTagsArrayIntoMap = function (tagsArray) {
    const tagsMap = {};
    for (const tag of tagsArray) tagsMap[tag] = true;
    return tagsMap;
};
// static method for Model Sales to convert incoming requests with tag strings into hashmaps(for actual requests)
saleSchema.statics.convertTagsStringIntoQueryObject = function (optional, tagsString) {
    // builds mongo query to match ALL tags from string
    const queryForMando = (string) => ({ and: string.split(',').map((t) => ({ [`tags.${t}`]: { exists: true } })) });
    // builds mongo query to match ANY tag from string
    const queryForOptional = (string) => ({ or: string.split(',').map((t) => ({ [`tags.${t}`]: { exists: true } })) });

    return optional ? queryForOptional(tagsString) : queryForMando(tagsString);
};

const Sale = mongoose.model('Sale', saleSchema);
module.exports = Sale;
