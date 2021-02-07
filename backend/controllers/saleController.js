const Sale = require('../models/saleModel');
const { remove } = require('../services/imageUpload');

// fn ( request, response )
exports.createSale = async ({ body, file }, resp) => {
    // error handling
    try {
        // creates sale using req.body and waits for promise to resolve b4 storing in var
        const newSale = await Sale.create({ mainImage: file.location, ...body });
        // return JSON
        resp.status(200).json({
            status: 'success',
            data: {
                sale: newSale,
            },
        });
    } catch (error) {
        // 400-> bad req + some json also remove un-used images from s3 bucket
        remove(`${process.env.BUCKET_NAME}`, file.key);
        resp.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// fn ( request, response )
exports.getAllSales = async (req, resp) => {
    // error handler
    try {
        // waits on promise, empty args => returns all sales
        const sales = await Sale.find();

        // return JSON
        resp.status(200).json({
            status: 'success',
            data: {
                sales: sales,
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