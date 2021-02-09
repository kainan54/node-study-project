const Sale = require('../models/saleModel');
const { remove } = require('../services/imageUpload');

// fn ( request, response )
exports.createSale = async ({ body, file: { location, key } }, resp) => {
    // error handling
    try {
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
    } catch (error) {
        // 400-> bad req + some json also remove un-used images from s3 bucket
        remove(`${process.env.BUCKET_NAME}`, key);
        resp.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// fn ( request, response )
exports.getAllSales = async ({ query }, resp) => {
    // error handler
    try {
        // building query
        const queryObj = query.tags
            ? { ...query, or: Sale.convertTagsStringIntoQueryObject(query.tags) }
            : { ...query };
        const excludedParams = ['page', 'sort', 'limit', 'fields', 'tags'];
        // removing specific params
        for (const param of excludedParams) delete queryObj[param];

        // fixings params for mogoDB operations eg., gte -> $gte
        const queryString = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt|exists|or)\b/g, (match) => `$${match}`);
        console.log('qs', queryString);
        // executing the query
        const updatedQuery = Sale.find(JSON.parse(queryString));
        console.log(JSON.parse(queryString));
        const sales = await updatedQuery;

        // return JSON / resp
        resp.status(200).json({
            status: 'success',
            data: {
                sales: sales,
            },
        });
    } catch (error) {
        resp.status(404).json({
            status: 'fail',
            message: `${error}`,
        });
    }
};

// fn ( request, response )
exports.getSale = async ({ params: { id } }, resp) => {
    // error handler
    try {
        // waits on promise, returns 1 sale from url/mongo id
        const sale = await Sale.findById(id);
        // ^ same as Sale.findOne({ _id: id })

        // return JSON
        resp.status(200).json({
            status: 'success',
            data: {
                sales: sale,
            },
        });
    } catch (error) {
        resp.status(404).json({
            status: 'fail',
            message: 'fail!',
        });
    }
};

// fn ( request, response )
exports.updateSale = async ({ params: { id, body } }, resp) => {
    // error handler
    try {
        // waits on promise, updates sale from url/mongo id + req body and saves to var
        const updatedSale = await Sale.findByIdAndUpdate(id, body, {
            // makes fn return updated Sale
            new: true,
            // make sure updates match schema
            runValidators: true,
        });

        // return JSON
        resp.status(200).json({
            status: 'success',
            data: {
                sale: updatedSale,
            },
        });
    } catch (error) {
        resp.status(404).json({
            status: 'fail',
            message: 'fail!',
        });
    }
};
// fn ( request, response )
exports.deleteSale = async ({ params: { id } }, resp) => {
    // error handler
    try {
        // waits on promise, updates sale from url/mongo id + req body and saves to var
        await Sale.findByIdAndDelete(id);

        // return JSON
        resp.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        resp.status(404).json({
            status: 'fail',
            message: 'fail!',
        });
    }
};
