const express = require('express');
const { upload } = require('../services/imageUpload');
/*
const userController = require('./../controllers/userController');
- or -
{ methodname, methodname, etc }
*/

const { createSale, getAllSales, getSalesStats } = require('../controllers/saleController');
const router = express.Router();

// middleware triggered for router params
router.param('id', (req, resp, next, val) => {
    console.log(val);
    next();
});

router.route('/stats').get(getSalesStats);

// => /sale
router
    .route('/')
    .get(getAllSales)
    // upload single uploads img to AWS bucket and injects file obj into req with path to url + more
    .post(upload.single('mainImage'), createSale);
// => /sale/:id
router
    .route('/:id')
    .get(() => {})
    .post(() => {});

module.exports = router;
