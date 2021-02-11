// setting up server with express
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const userRouter = require('./routes/userRoutes');
const saleRouter = require('./routes/saleRoutes');

const server = express();

// middlware
if (process.env.NODE_ENV === 'development') {
    server.use(morgan('dev'));
}
server.use(express.json());
server.use(cors());

// routes
server.use('/user', userRouter);
server.use('/sales', saleRouter);
server.get('/', (req, resp) => {
    resp.status(200).json({
        message: 'Hello from the node server',
    });
});

module.exports = server;
