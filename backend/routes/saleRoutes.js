const express = require('express');
const { upload } = require('../services/imageUpload');
/*
const userController = require('./../controllers/userController');
- or -
{ methodname, methodname, etc }
*/

const { createSale, getAllSales, getSalesStats, aggTest } = require('../controllers/saleController');
const router = express.Router();

// middleware triggered for router params
router.param('id', (req, resp, next, val) => {
    console.log(val);
    next();
});

// test route for data about tags
router.route('/aggTest').get(aggTest);

// for stats about data
router.route('/stats').get(getSalesStats);

// => /sale/:id
router
    .route('/:id')
    .get(() => {})
    .post(() => {});

// => /sale
router
    .route('/')
    .get(getAllSales)
    // upload single uploads img to AWS bucket and injects file obj into req with path to url + more
    .post(upload.single('mainImage'), createSale);

module.exports = router;
