const express = require('express');
const { upload } = require('../services/imageUpload');
/*
const userController = require('./../controllers/userController');
- or -
{ methodname, methodname, etc }
*/

const salesController = require('./../controllers/saleController');
const router = express.Router();

// middleware triggered for router params
router.param('id', (req, resp, next, val) => {
    console.log(val);
    next();
});

// => /sale
router
    .route('/')
    .get(() => {})
    // upload single uploads img to AWS bucket and injects file obj into req with path to url + more
    .post(upload.single('mainImage'), salesController.createSale);
// => /sale/:id
router
    .route('/:id')
    .get(() => {})
    .post(() => {});

module.exports = router;
