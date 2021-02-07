const express = require('express');
/*
const userController = require('./../controllers/userController');
- or -
{ methodname, methodname, etc }
*/
const router = express.Router();

// middleware triggered for router params
router.param('id', (req, resp, next, val) => {
    console.log(val);
    next();
});

// => /users
router
    .route('/')
    .get(() => {})
    .post(() => {});
// => /users/:id
router
    .route('/:id')
    .get(() => {})
    .post(() => {});

module.exports = router;
