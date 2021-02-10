/* eslint-disable require-jsdoc */
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
/** MyClass description */
class ApiInterface {
    // eslint-disable-next-line require-jsdoc
    constructor(query, queryObject) {
        this.query = query;
        this.queryObject = queryObject;
    }

    // eslint-disable-next-line require-jsdoc
    filter() {
        let optionalTags = {};
        let mandoTags = {};
        // builds part of mongoDB query to match tags
        if (this.queryObject.tags) optionalTags = Sale.convertTagsStringIntoQueryObject(true, this.queryObject.tags);
        if (this.queryObject.manTags)
            mandoTags = Sale.convertTagsStringIntoQueryObject(false, this.queryObject.manTags);

        //  formatting query for MongoDB/mongoose.find() query
        const formattedQueryObject = { ...this.queryObject, ...optionalTags, ...mandoTags };
        const excludedParams = ['page', 'limit', 'fields', 'tags', 'manTags', 'sort'];

        // removing specific params
        for (const param of excludedParams) delete formattedQueryObject[param];

        // fixings params for mongoDB operations eg., gte -> $gte
        const queryString = JSON.stringify(formattedQueryObject).replace(
            /\b(gte|gt|lte|lt|exists|or|and|all)\b/g,
            (match) => `$${match}`,
        );
        // executing the query
        this.query = this.query.find(JSON.parse(queryString));
        // for chaining
        return this;
    }

    // eslint-disable-next-line require-jsdoc
    sort() {
        // sorting
        if (this.queryObject.sort) {
            const sortParams = this.queryObject.sort.split(',').join(' ');

            this.query = this.query.sort(sortParams);
        } else {
            // default is to sort by newest ie., createdAt DESC order and than by name
            this.query = this.query.sort('-createdAt title');
        }
        return this;
    }

    limitFields() {
        if (this.queryObject.fields) {
            const fields = this.queryObject.fields.split(',').join(' ');
            // select is mongoose method expects string of keys to include formatted like: 'key1 key2'
            this.query = this.query.select(fields);
        } else {
            // includes everything but version key (only backend needs it)
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const page = this.queryObject.page * 1 || 1;
        const limit = this.queryObject.limit * 1 || 100;
        const skip = (page - 1) * limit;
        /* 
            skip and limit are moongoose methods to help select current page and results per page
            limit === numbers of results per page
            skip === number of results to skip -> page * limit
        */

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

// fn ( request, response )
exports.getAllSales = async ({ query }, resp) => {
    // error handler
    try {
        const interface = new ApiInterface(Sale.find(), query).filter().sort().limitFields().paginate();
        console.log(interface.query);
        const sales = await interface.query;

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
