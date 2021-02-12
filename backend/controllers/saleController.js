const Sale = require('../models/saleModel');
const { remove } = require('../services/imageUpload');
const ApiInterface = require('../services/apiInterface');
const AppError = require('../services/appError');
const asyncErrorWrapper = require('../services/asyncErrorWrapper');

// fn ( request, response )
exports.createSale = asyncErrorWrapper(async ({ body, file: { location, key } }, resp) => {
    // creates sale using req.body and waits for promise to resolve b4 storing in var
    const newSale = await Sale.create({
        ...body,
        mainImage: { url: location, key: key },
        tags: Sale.convertTagsArrayIntoMap(body.tags),
    });
    // return JSON
    resp.status(200).json({
        status: 'success',
        data: {
            sale: newSale,
        },
    });

    // 400-> bad req + some json also remove un-used images from s3 bucket
    remove(`${process.env.BUCKET_NAME}`, key);
    resp.status(400).json({
        status: 'fail',
        message: error.message,
    });
});
// fn ( request, response )
exports.getAllSales = asyncErrorWrapper(async ({ query }, resp) => {
    const interface = new ApiInterface(Sale.find(), query).filter().sort().limitFields().paginate();
    const sales = await interface.query;

    // return JSON / resp
    resp.status(200).json({
        status: 'success',
        data: {
            sales: sales,
        },
    });
});

// fn ( request, response )
exports.getSale = asyncErrorWrapper(async ({ params: { id } }, resp, next) => {
    // waits on promise, returns 1 sale from url/mongo id
    const sale = await Sale.findById(id);
    // ^ same as Sale.findOne({ _id: id })

    if (!sale) {
        // return to avoid running code below
        return next(new AppError(`No Sale matched with ID(${id})`, 404));
    }
    // return JSON
    resp.status(200).json({
        status: 'success',
        data: {
            sales: sale,
        },
    });
});

// fn ( request, response )
exports.updateSale = asyncErrorWrapper(async ({ params: { id, body } }, resp) => {
    // waits on promise, updates sale from url/mongo id + req body and saves to var
    const updatedSale = await Sale.findByIdAndUpdate(id, body, {
        // makes fn return updated Sale
        new: true,
        // make sure updates match schema
        runValidators: true,
    });

    if (!sale) {
        // return to avoid running code below
        return next(new AppError(`No Sale matched with ID(${id})`, 404));
    }

    // return JSON
    resp.status(200).json({
        status: 'success',
        data: {
            sale: updatedSale,
        },
    });
});
// fn ( request, response )
exports.deleteSale = asyncErrorWrapper(async ({ params: { id } }, resp) => {
    // waits on promise, updates sale from url/mongo id + req body and saves to var
    const sale = await Sale.findByIdAndDelete(id);

    if (!sale) {
        // return to avoid running code below
        return next(new AppError(`No Sale matched with ID(${id})`, 404));
    }

    // return JSON
    resp.status(204).json({
        status: 'success',
        data: null,
    });
});

// gets  random aggregate stats
exports.getSalesStats = asyncErrorWrapper(async (req, resp) => {
    const stats = await Sale.aggregate([
        // {
        //     $match: { price: { $gte: 0 } },
        // },
        {
            $group: {
                // always specify id for grping, null puts everything in 1 group
                _id: '$qty',
                // stats for groups
                numberOfSales: { $sum: 1 },
                avgRatings: { $avg: '$ratingsAvg' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { avgPrice: 1 },
        },
    ]);

    resp.status(200).json({
        status: 'success',
        data: { stats },
    });
});
// gets agg stats for tags
exports.aggTest = asyncErrorWrapper(async (req, resp) => {
    const stats = await Sale.aggregate([
        {
            $addFields: {
                tags: { $objectToArray: '$tags' },
            },
        },

        {
            $unwind: '$tags',
        },

        {
            $group: {
                // always specify id for grping, null puts everything in 1 group
                _id: '$tags.k',
                // stats for groups
                timesUsed: { $sum: 1 },
                avgRatings: { $avg: '$ratingsAvg' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { timesUsed: -1 },
        },
    ]);

    resp.status(200).json({
        status: 'success',
        data: { stats },
    });
});
