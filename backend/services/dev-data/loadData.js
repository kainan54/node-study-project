const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const server = require('../../app');
const { directUpload, remove } = require('../imageUpload');
const Sale = require('../../models/saleModel');

// path to environment vars
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

// import json to var/array
const sales = JSON.parse(fs.readFileSync(`${__dirname}/data.json`, 'utf-8'));

// creates 1 sale instance
const loadSale = async (data, sale) => {
    const awsKey = data.key.match(/\d+$/).pop();
    try {
        await Sale.create({
            ...sale,
            mainImage: {
                url: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${awsKey}`,
                key: awsKey,
            },
            tags: Sale.convertTagsArrayIntoMap(sale.tags),
        });
    } catch (error) {
        console.log(error);
    }
};
// wipes sales and then creates sales from array/json...uses directUpload fn to store images on s3 bucket
const seedData = async () => {
    await Sale.deleteMany();
    for (const sale of sales) {
        directUpload(process.env.BUCKET_NAME, sale.imageUrl.replace('.', `${__dirname}`), loadSale, sale);
    }
};

seedData();
