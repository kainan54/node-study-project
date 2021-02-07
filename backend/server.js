// setting up mongoose
const mongoose = require('mongoose');
// loading environment vars
const dotenv = require('dotenv');
// importing express server
const server = require('./app');

// environment vars
dotenv.config({ path: './config.env' });
// DB STRING FROM ATLAS
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

// MONGOOSE SETTINGS => Returns Promise
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    .then((con) => {
        console.log(con.connections);
        console.log('DB Connection successful!');
    });

// initializing server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server Listening on port ${port}...`);
});
