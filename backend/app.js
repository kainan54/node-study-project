// setting up server with express
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const userRouter = require('./routes/userRoutes');
const saleRouter = require('./routes/saleRoutes');
const AppError = require('./services/appError');
const errorHandler = require('./services/errorHandler');

const server = express();

// middlware
if (process.env.NODE_ENV === 'development') {
    server.use(morgan('dev'));
}
server.use(express.json());
server.use(cors());

// routes
server.use('/api/v1/user', userRouter);
server.use('/api/v1/sales', saleRouter);

// NO MATCHED ROUTES CATCHER(must be at bottom), .all = all http verbs, * is like uni selector but for routes
server.all('*', (req, resp, next) => {
    // old way:
    // resp.status(404).json({
    //     status: 'fail',
    //     message: `Cannot find route for URL-PATH: ${req.originalUrl}`,
    // });

    // new way (goes thru global handler)
    next(new AppError(`Cannot find route for URL-PATH: ${req.originalUrl}`, 404));
});

// 4 params tells express that this is a error handling middleware
server.use(errorHandler);

module.exports = server;
