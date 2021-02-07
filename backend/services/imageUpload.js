const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new aws.S3();

// setting up aws with enivironment vars
aws.config.update({
    secretAccessKey: process.env.AWS_SECRET,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    region: 'us-east-1',
});

// validates file type -> fn (request, file, callback fn)
const fileFilter = (req, file, cb) => {
    // jpg or png
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
    }
};

exports.upload = multer({
    fileFilter,
    storage: multerS3({
        acl: 'public-read',
        s3: s3,
        bucket: `appa-shop-bucket`,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: 'TESTING_METADATA' });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString());
        },
    }),
});

exports.remove = (bucketName, fileName) => {
    s3.deleteObject(
        {
            Bucket: bucketName,
            Key: fileName,
        },
        (err, data) => {
            if (err) console.log(err, err.stack);
        },
    );
};

